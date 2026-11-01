<?php

namespace Tests\Feature\Ai;

use App\Exceptions\Ai\AiProviderException;
use App\Services\Ai\Guardrails\TrialGuard;
use App\Services\Ai\Providers\LayerCloudProvider;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use Psr\Http\Message\RequestInterface;
use Tests\TestCase;

/**
 * The LayerCloud route is fenced on purpose. These tests lock the fence down:
 * loosening any guard rail breaks a test here.
 */
class LayerCloudProviderTest extends TestCase
{
    private ?RequestInterface $lastRequest = null;

    protected function setUp(): void
    {
        parent::setUp();

        $this->lastRequest = null;

        config()->set('services.layercloud', [
            'api_key' => 'lc_test_key',
            'base_url' => 'https://ai.layercloud.org/v1',
            'enabled' => true,
            'trial_only' => true,
            'default_model' => 'zai/glm-5.3-flash',
            'allowed_models' => '',
            'daily_token_budget' => 200000,
            'max_output_tokens' => 1024,
            'free_models' => ['zai/glm-5.3-flash', 'deepseek/deepseek-v4-pro-0813'],
            'model_pricing' => [
                'zai/glm-5.3-flash' => [0.0187, 0.0625],
                'deepseek/deepseek-v4-pro-0813' => [0.2802, 0.8405],
            ],
        ]);

        (new TrialGuard())->reset();
    }

    public function test_it_posts_to_the_gateway_and_normalises_the_reply(): void
    {
        $provider = $this->provider(new Response(200, [], $this->completionBody()));

        $result = $provider->chat([
            ['role' => 'user', 'content' => 'Who is a good Instagram specialist?'],
        ]);

        $this->assertSame('ok', $result['content']);
        $this->assertSame('layercloud', $result['provider']);
        $this->assertSame('zai/glm-5.3-flash', $result['model_code']);
        $this->assertSame(120, $result['usage']['prompt_tokens']);
        $this->assertSame(8, $result['usage']['completion_tokens']);
        $this->assertIsFloat($result['estimated_cost_usd']);

        $body = $this->sentBody();

        $this->assertSame('https://ai.layercloud.org/v1/chat/completions', $this->sentUri());
        $this->assertSame('Bearer lc_test_key', $this->sentHeader('Authorization'));
        $this->assertSame('zai/glm-5.3-flash', $body['model'] ?? null);
        $this->assertFalse($body['stream'] ?? null);
    }

    public function test_it_refuses_a_paid_model(): void
    {
        $provider = $this->provider(new Response(200, [], $this->completionBody()));

        $this->expectException(AiProviderException::class);
        $this->expectExceptionMessage('not on the free-tier allow-list');

        $provider->chat([['role' => 'user', 'content' => 'hi']], ['model' => 'anthropic/claude-sonnet-5']);
    }

    public function test_it_refuses_de_aligned_variants(): void
    {
        // Even if someone adds the id to the allow-list, the suffix check fires.
        config()->set('services.layercloud.free_models', ['zai/glm-5.3:jailbreak']);

        $provider = $this->provider(new Response(200, [], $this->completionBody()));

        $this->expectException(AiProviderException::class);
        $this->expectExceptionMessage('de-aligned variant');

        $provider->chat([['role' => 'user', 'content' => 'hi']], ['model' => 'zai/glm-5.3:jailbreak']);
    }

    public function test_it_refuses_to_run_when_disabled(): void
    {
        config()->set('services.layercloud.enabled', false);

        $provider = $this->provider(new Response(200, [], $this->completionBody()));

        $this->expectException(AiProviderException::class);
        $this->expectExceptionMessage('the provider is disabled');

        $provider->chat([['role' => 'user', 'content' => 'hi']]);
    }

    public function test_it_refuses_to_run_in_production_while_trial_only(): void
    {
        $this->app->detectEnvironment(static fn (): string => 'production');

        $provider = $this->provider(new Response(200, [], $this->completionBody()));

        $this->expectException(AiProviderException::class);
        $this->expectExceptionMessage('production environment');

        $provider->chat([['role' => 'user', 'content' => 'hi']]);
    }

    public function test_it_runs_in_production_once_trial_only_is_off(): void
    {
        $this->app->detectEnvironment(static fn (): string => 'production');
        config()->set('services.layercloud.trial_only', false);

        $provider = $this->provider(new Response(200, [], $this->completionBody()));
        $result = $provider->chat([['role' => 'user', 'content' => 'hi']]);

        $this->assertSame('ok', $result['content']);
    }

    public function test_it_redacts_identifiers_before_they_leave_the_app(): void
    {
        $provider = $this->provider(new Response(200, [], $this->completionBody()));

        $result = $provider->chat([
            ['role' => 'user', 'content' => 'Email saeid@example.com or call 09121234567 about 0013546987'],
        ]);

        $sent = $this->sentBody();
        $messages = $sent['messages'] ?? [];
        $content = is_array($messages) && isset($messages[0]['content']) ? (string) $messages[0]['content'] : '';

        $this->assertStringNotContainsString('saeid@example.com', $content);
        $this->assertStringNotContainsString('09121234567', $content);
        $this->assertStringNotContainsString('0013546987', $content);
        $this->assertGreaterThanOrEqual(3, $result['redactions']);
    }

    public function test_it_clamps_the_output_token_ceiling(): void
    {
        config()->set('services.layercloud.max_output_tokens', 256);

        $provider = $this->provider(new Response(200, [], $this->completionBody()));
        $provider->chat([['role' => 'user', 'content' => 'hi']], ['max_tokens' => 32000]);

        $this->assertSame(256, $this->sentBody()['max_tokens'] ?? null);
    }

    public function test_it_records_usage_against_the_daily_budget(): void
    {
        $provider = $this->provider(new Response(200, [], $this->completionBody()));

        $result = $provider->chat([['role' => 'user', 'content' => 'hi']]);

        $this->assertSame(128, $result['trial']['used_today']);
        $this->assertSame(200000 - 128, $result['trial']['remaining']);
    }

    public function test_it_stops_at_the_daily_budget(): void
    {
        config()->set('services.layercloud.daily_token_budget', 100);
        (new TrialGuard())->recordUsage(150);

        $provider = $this->provider(new Response(200, [], $this->completionBody()));

        $this->expectException(AiProviderException::class);
        $this->expectExceptionMessage('daily token budget');

        $provider->chat([['role' => 'user', 'content' => 'hi']]);
    }

    public function test_it_surfaces_upstream_errors_without_leaking_the_key(): void
    {
        $provider = $this->provider(new Response(402, [], '{"error":"insufficient balance"}'));

        try {
            $provider->chat([['role' => 'user', 'content' => 'hi']]);
            $this->fail('Expected AiProviderException.');
        } catch (AiProviderException $exception) {
            $this->assertStringContainsString('HTTP 402', $exception->getMessage());
            $this->assertStringContainsString('insufficient balance', $exception->getMessage());
            $this->assertStringNotContainsString('lc_test_key', $exception->getMessage());
        }
    }

    public function test_it_estimates_cost_only_for_priced_models(): void
    {
        $provider = $this->provider(new Response(200, [], $this->completionBody()));

        $this->assertNull($provider->estimateCost('unknown/model', 1000, 1000));
        $this->assertEqualsWithDelta(0.00000625, $provider->estimateCost('zai/glm-5.3-flash', 0, 100), 1e-12);
        $this->assertEqualsWithDelta(0.0003312, $provider->estimateCost('zai/glm-5.3-flash', 1000, 5000), 1e-12);
    }

    private function provider(Response $response): LayerCloudProvider
    {
        $stack = HandlerStack::create(new MockHandler([$response]));
        $stack->push(Middleware::mapRequest(function (RequestInterface $request): RequestInterface {
            $this->lastRequest = $request;

            return $request;
        }));

        return new LayerCloudProvider(new Client(['handler' => $stack]), 'lc_test_key');
    }

    private function completionBody(): string
    {
        return (string) json_encode([
            'id' => 'chatcmpl-test',
            'model' => 'zai/glm-5.3-flash',
            'choices' => [
                ['index' => 0, 'message' => ['role' => 'assistant', 'content' => 'ok'], 'finish_reason' => 'stop'],
            ],
            'usage' => ['prompt_tokens' => 120, 'completion_tokens' => 8, 'total_tokens' => 128],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function sentBody(): array
    {
        if ($this->lastRequest === null) {
            $this->fail('No request reached the mocked gateway.');
        }

        $decoded = json_decode((string) $this->lastRequest->getBody(), true);

        return is_array($decoded) ? $decoded : [];
    }

    private function sentUri(): string
    {
        if ($this->lastRequest === null) {
            $this->fail('No request reached the mocked gateway.');
        }

        return (string) $this->lastRequest->getUri();
    }

    private function sentHeader(string $name): string
    {
        if ($this->lastRequest === null) {
            $this->fail('No request reached the mocked gateway.');
        }

        return $this->lastRequest->getHeaderLine($name);
    }
}
