<?php

namespace Tests\Unit;

use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Models\Option;
use App\Services\Notifications\Channels\EitaaNotificationChannel;
use App\Services\Notifications\EitaaGateway;
use App\Services\Notifications\NotificationChannelManager;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class EitaaGatewayTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        Schema::create('options', function (Blueprint $table): void {
            $table->id();
            $table->string('group')->default('general');
            $table->string('key')->unique();
            $table->json('value');
            $table->boolean('autoload')->default(false);
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Cache::flush();
        Schema::dropIfExists('options');

        parent::tearDown();
    }

    public function test_it_sends_direct_eitaa_notification_with_the_existing_app_token_option(): void
    {
        Option::set('eitaa_app_token', 'app-secret', 'notifications');

        Http::fake([
            'https://eitaayar.ir/api/app/sendMessage' => Http::response([
                'ok' => true,
                'result' => ['message_id' => 981],
            ]),
        ]);

        $result = app(EitaaGateway::class)->sendToAppChat(
            chatId: '123456789012345678',
            text: 'پیام آزمایشی',
        );

        $this->assertTrue($result->successful);
        $this->assertSame('eitaa-yar', $result->provider);
        $this->assertSame('981', $result->messageId);

        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://eitaayar.ir/api/app/sendMessage'
            && $request['token'] === 'app-secret'
            && $request['chat_id'] === 123456789012345678
            && $request['text'] === 'پیام آزمایشی'
        );
    }

    public function test_it_sends_to_the_legal_questions_channel_with_existing_bot_options(): void
    {
        Option::set('eitaa_token_bot', '"bot-secret"', 'notifications');
        Option::set('legal_questions_channel_eitaaid', '-10011223344', 'notifications');

        Http::fake([
            'https://eitaayar.ir/api/bot-secret/sendMessage' => Http::response([
                'ok' => true,
                'result' => ['message_id' => 'channel-message-1'],
            ]),
        ]);

        $result = app(EitaaGateway::class)->sendToLegalQuestionsChannel('پرسش حقوقی جدید');

        $this->assertTrue($result->successful);
        $this->assertSame('channel-message-1', $result->messageId);

        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://eitaayar.ir/api/bot-secret/sendMessage'
            && $request['chat_id'] === -10011223344
            && $request['title'] === ''
            && $request['text'] === 'پرسش حقوقی جدید'
            && str_contains((string) $request->header('Content-Type')[0], 'application/json')
        );
    }

    public function test_it_validates_the_configured_bot_token_with_get_me(): void
    {
        Option::set('eitaa_token_bot', 'bot123:token-value', 'notifications');

        Http::fake([
            'https://eitaayar.ir/api/bot123:token-value/getMe' => Http::response([
                'ok' => true,
                'result' => [
                    'id' => 11017928,
                    'is_bot' => true,
                    'username' => 'dadline_bot',
                ],
            ]),
        ]);

        $result = app(EitaaGateway::class)->getBotInfo();

        $this->assertTrue($result->successful);
        $this->assertSame(11017928, data_get($result->payload, 'response.result.id'));
        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://eitaayar.ir/api/bot123:token-value/getMe'
            && $request->method() === 'GET'
        );
    }

    public function test_it_returns_an_actionable_error_for_an_unauthorized_bot_token(): void
    {
        Option::set('eitaa_token_bot', 'bot123:revoked-token', 'notifications');
        Option::set('legal_questions_channel_eitaaid', '11040164', 'notifications');

        Http::fake([
            'https://eitaayar.ir/api/bot123:revoked-token/sendMessage' => Http::response([
                'ok' => false,
                'error_code' => 401,
                'description' => 'Unauthorized',
            ]),
        ]);

        $result = app(EitaaGateway::class)->sendToLegalQuestionsChannel('پیام');

        $this->assertFalse($result->successful);
        $this->assertSame('401', $result->errorCode);
        $this->assertSame('توکن API ایتایار نامعتبر، منقضی یا لغو شده است.', $result->errorMessage);
        $this->assertFalse($result->retryable);
    }

    public function test_it_fails_without_calling_the_provider_when_required_options_are_missing(): void
    {
        Http::fake();

        $result = app(EitaaGateway::class)->sendToLegalQuestionsChannel('پیام');

        $this->assertFalse($result->successful);
        $this->assertSame('provider_not_configured', $result->errorCode);
        $this->assertFalse($result->retryable);
        Http::assertNothingSent();
    }

    public function test_notification_manager_uses_the_real_eitaa_channel(): void
    {
        $driver = app(NotificationChannelManager::class)->driver(NotificationChannel::Eitaa);

        $this->assertInstanceOf(EitaaNotificationChannel::class, $driver);
    }

    public function test_eitaa_notification_channel_uses_delivery_recipient_and_body(): void
    {
        Option::set('eitaa_app_token', 'app-secret', 'notifications');

        Http::fake([
            'https://eitaayar.ir/api/app/sendMessage' => Http::response(['ok' => true]),
        ]);

        $delivery = new NotificationDelivery([
            'channel' => NotificationChannel::Eitaa,
            'recipient' => '778899',
            'body' => 'متن اعلان',
        ]);

        $result = app(EitaaNotificationChannel::class)->send($delivery);

        $this->assertTrue($result->successful);
        Http::assertSent(fn (Request $request): bool =>
            $request['chat_id'] === 778899
            && $request['text'] === 'متن اعلان'
        );
    }
}
