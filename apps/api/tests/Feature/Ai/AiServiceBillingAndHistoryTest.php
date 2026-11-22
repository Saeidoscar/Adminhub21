<?php

namespace Tests\Feature\Ai;

use App\Enums\WalletTransactionType;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\AiModel;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Ai\AiService;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Psr\Http\Message\RequestInterface;
use Tests\TestCase;

class AiServiceBillingAndHistoryTest extends TestCase
{
    use RefreshDatabase;

    /** @var array<int, RequestInterface> */
    private array $requests = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->requests = [];

        config()->set('services.arvancloud.api_key', 'arvan_test_key');
        config()->set('services.arvancloud.base_url', 'https://arvancloudai.ir/v1');
        config()->set('services.avalai.api_key', 'avalai_test_key');
        config()->set('services.avalai.base_url', 'https://api.avalai.ir/v1');

        config()->set('ai.usd_to_toman', 270000);
        config()->set('ai.markup_rate', 0.40);
        config()->set('ai.free_allowance.enabled', true);
        config()->set('ai.free_allowance.daily_tokens', 25000);
    }

    public function test_send_message_forwards_full_chronological_history_and_system_prompt(): void
    {
        $user = $this->makeUser();
        $model = AiModel::create([
            'provider' => 'avalai',
            'code' => 'deepseek-v4.1-flash',
            'name' => 'DeepSeek V4.1 Flash',
            'in_usd' => 0.15,
            'out_usd' => 0.60,
            'is_active' => true,
        ]);

        $conversation = AiConversation::create([
            'user_id' => $user->id,
            'type' => 'marketplace_help',
            'model_id' => $model->id,
        ]);

        AiMessage::create([
            'conversation_id' => $conversation->id,
            'prompt' => 'What is AdminHub21?',
            'response' => 'It connects employers with social media specialists.',
            'in_tokens' => 20,
            'out_tokens' => 15,
            'billing_source' => 'free_allowance',
            'cost_toman' => 0,
        ]);

        $this->bindGuzzleMock([
            new Response(200, [], $this->completionBody('deepseek-v4.1-flash', 'Yes, escrow is supported.', 150, 40)),
        ]);

        $reply = app(AiService::class)->sendMessage($conversation, [
            'prompt' => 'Does it support escrow?',
        ]);

        $this->assertSame('Yes, escrow is supported.', $reply->response);
        $this->assertSame('free_allowance', $reply->billing_source);
        $this->assertSame(0, $reply->cost_toman);

        $this->assertCount(1, $this->requests);
        $sent = json_decode((string) $this->requests[0]->getBody(), true);

        $this->assertSame('system', $sent['messages'][0]['role']);
        $this->assertSame('user', $sent['messages'][1]['role']);
        $this->assertSame('What is AdminHub21?', $sent['messages'][1]['content']);
        $this->assertSame('assistant', $sent['messages'][2]['role']);
        $this->assertSame('It connects employers with social media specialists.', $sent['messages'][2]['content']);
        $this->assertSame('user', $sent['messages'][3]['role']);
        $this->assertSame('Does it support escrow?', $sent['messages'][3]['content']);
    }

    public function test_paid_task_rejects_unfunded_wallet_before_calling_upstream_provider(): void
    {
        $user = $this->makeUser();
        $model = AiModel::create([
            'provider' => 'arvancloud',
            'code' => 'claude-sonnet-4-6',
            'name' => 'Claude Sonnet 4.6',
            'in_usd' => 3.00,
            'out_usd' => 15.00,
            'is_active' => true,
        ]);

        $conversation = AiConversation::create([
            'user_id' => $user->id,
            'type' => 'contract_review',
            'model_id' => $model->id,
        ]);

        $this->bindGuzzleMock([
            new Response(200, [], $this->completionBody('claude-sonnet-4-6', 'Should never be called', 100, 100)),
        ]);

        try {
            app(AiService::class)->sendMessage($conversation, [
                'prompt' => 'Review this contract clause.',
            ]);
            $this->fail('Expected ValidationException for insufficient wallet balance.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('wallet', $e->errors());
        }

        // Crucial: zero upstream HTTP calls were made.
        $this->assertCount(0, $this->requests);
    }

    public function test_paid_task_debits_exact_toman_cost_from_wallet(): void
    {
        $user = $this->makeUser();
        Wallet::query()->create([
            'user_id' => $user->id,
            'balance' => 100_000,
            'withdrawable_balance' => 100_000,
            'blocked_balance' => 0,
        ]);

        $model = AiModel::create([
            'provider' => 'arvancloud',
            'code' => 'claude-sonnet-4-6',
            'name' => 'Claude Sonnet 4.6',
            'in_usd' => 3.00,
            'out_usd' => 15.00,
            'is_active' => true,
        ]);

        $conversation = AiConversation::create([
            'user_id' => $user->id,
            'type' => 'contract_review',
            'model_id' => $model->id,
        ]);

        // 2,000 in ($0.006) + 1,000 out ($0.015) = $0.021 raw
        // $0.021 * 270,000 * 1.40 = 7,938 Toman
        $this->bindGuzzleMock([
            new Response(200, [], $this->completionBody('claude-sonnet-4-6', 'Looks good.', 2000, 1000)),
        ]);

        $message = app(AiService::class)->sendMessage($conversation, [
            'prompt' => 'Review this contract.',
        ]);

        $this->assertSame('wallet', $message->billing_source);
        $this->assertSame(7938, $message->cost_toman);

        $wallet = $user->wallet()->firstOrFail();
        $this->assertSame(100_000 - 7938, $wallet->balance);
        $this->assertSame(100_000 - 7938, $wallet->withdrawable_balance);

        $tx = WalletTransaction::query()->where('user_id', $user->id)->latest('id')->firstOrFail();
        $this->assertSame(WalletTransactionType::AiTokenPurchase, $tx->type);
        $this->assertSame(7938, $tx->amount);
    }

    public function test_models_providers_and_conversation_ownership_endpoints(): void
    {
        $owner = $this->makeUser();
        $intruder = $this->makeUser();

        $model = AiModel::create([
            'provider' => 'arvancloud',
            'code' => 'gpt-5-mini',
            'name' => 'GPT-5 Mini',
            'in_usd' => 0.25,
            'out_usd' => 2.00,
            'is_active' => true,
        ]);

        $conversation = AiConversation::create([
            'user_id' => $owner->id,
            'type' => 'marketplace_help',
            'model_id' => $model->id,
        ]);

        Sanctum::actingAs($owner, [], 'sanctum');

        $this->getJson('/api/v1/ai/models')
            ->assertOk()
            ->assertJsonPath('billing.currency', 'TOMAN')
            ->assertJsonPath('models.0.code', 'gpt-5-mini')
            ->assertJsonStructure([
                'models' => [
                    ['id', 'provider', 'code', 'in_toman_per_1m', 'out_toman_per_1m', 'estimated_turn_toman'],
                ],
            ]);

        $providersResponse = $this->getJson('/api/v1/ai/providers')
            ->assertOk()
            ->assertJsonPath('default_provider', 'arvancloud')
            ->assertJsonPath('arvancloud.configured', true)
            ->assertJsonPath('avalai.configured', true);

        $this->assertStringNotContainsString('arvan_test_key', (string) $providersResponse->getContent());
        $this->assertStringNotContainsString('avalai_test_key', (string) $providersResponse->getContent());

        Sanctum::actingAs($intruder, [], 'sanctum');

        $this->getJson("/api/v1/ai/conversations/{$conversation->id}")
            ->assertForbidden();
    }

    private function makeUser(): User
    {
        return User::create([
            'name' => 'AI User',
            'email' => uniqid('ai') . '@test.com',
            'phone' => '+989' . random_int(100000000, 999999999),
            'password' => bcrypt('secret'),
            'role' => 'employer',
        ]);
    }

    /**
     * @param array<int, Response> $responses
     */
    private function bindGuzzleMock(array $responses): void
    {
        $stack = HandlerStack::create(new MockHandler($responses));
        $stack->push(Middleware::mapRequest(function (RequestInterface $request): RequestInterface {
            $this->requests[] = $request;

            return $request;
        }));

        $this->app->instance('guzzle', new Client(['handler' => $stack]));
    }

    private function completionBody(string $model, string $content, int $inTokens, int $outTokens): string
    {
        return (string) json_encode([
            'id' => 'chatcmpl-test',
            'model' => $model,
            'choices' => [
                ['index' => 0, 'message' => ['role' => 'assistant', 'content' => $content], 'finish_reason' => 'stop'],
            ],
            'usage' => [
                'prompt_tokens' => $inTokens,
                'completion_tokens' => $outTokens,
                'total_tokens' => $inTokens + $outTokens,
            ],
        ]);
    }
}
