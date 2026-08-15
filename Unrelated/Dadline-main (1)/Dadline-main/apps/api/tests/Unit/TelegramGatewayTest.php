<?php

namespace Tests\Unit;

use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Models\Option;
use App\Services\Notifications\Channels\TelegramNotificationChannel;
use App\Services\Notifications\NotificationChannelManager;
use App\Services\Notifications\TelegramGateway;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use ReflectionMethod;
use Tests\TestCase;

class TelegramGatewayTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('options', function (Blueprint $table): void {
            $table->id();
            $table->string('group')->default('general');
            $table->string('key')->unique();
            $table->json('value');
            $table->boolean('autoload')->default(false);
            $table->timestamps();
        });

        Cache::flush();
        Option::set('telegram_bot_enabled', '1', 'notifications');
        Option::set('telegram_bot_token', 'bot-secret', 'notifications');
        Option::set('telegram_bot_api_base_url', 'https://api.telegram.org', 'notifications');
        Option::set('telegram_bot_relay_enabled', '0', 'notifications');
        Option::set('telegram_bot_relay_fallback_enabled', '0', 'notifications');
        Option::set('telegram_bot_proxy_enabled', '1', 'notifications');
        Option::set('telegram_bot_direct_fallback_enabled', '0', 'notifications');
        Option::set('telegram_bot_disable_link_preview', '1', 'notifications');
    }

    protected function tearDown(): void
    {
        Cache::flush();
        Schema::dropIfExists('options');

        parent::tearDown();
    }

    public function test_it_sends_a_message_through_a_configured_proxy(): void
    {
        Option::set('telegram_bot_proxies', ['http://proxy-one.test:8080'], 'notifications');

        $gateway = app(TelegramGateway::class);
        $requestMethod = new ReflectionMethod($gateway, 'request');
        $pendingRequest = $requestMethod->invoke($gateway, [
            'transport' => 'proxy',
            'proxy' => 'http://proxy-one.test:8080',
            'fingerprint' => substr(hash('sha256', 'http://proxy-one.test:8080'), 0, 12),
            'url' => 'https://api.telegram.org/botbot-secret/sendMessage',
            'relay_secret' => null,
        ]);

        $this->assertSame(
            'http://proxy-one.test:8080',
            $pendingRequest->getOptions()['proxy'] ?? null,
        );

        Http::fake(function (Request $request) {
            $this->assertSame('proxy', $request->attributes()['telegram_transport'] ?? null);
            $this->assertSame(
                substr(hash('sha256', 'http://proxy-one.test:8080'), 0, 12),
                $request->attributes()['telegram_proxy_fingerprint'] ?? null,
            );

            return Http::response([
                'ok' => true,
                'result' => [
                    'message_id' => 91,
                    'chat' => ['id' => -100123456],
                ],
            ]);
        });

        $result = $gateway->sendToChat('@dadlinenet', 'پیام آزمایشی');

        $this->assertTrue($result->successful);
        $this->assertSame('telegram-bot-api', $result->provider);
        $this->assertSame('91', $result->messageId);
        $this->assertSame('proxy', $result->payload['transport']);
        $this->assertSame('-100123456', $result->payload['telegram']['chat_id']);

        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://api.telegram.org/botbot-secret/sendMessage'
            && $request['chat_id'] === '@dadlinenet'
            && $request['text'] === 'پیام آزمایشی'
            && $request['link_preview_options'] === ['is_disabled' => true]
        );
    }

    public function test_it_rotates_to_the_next_proxy_after_a_connection_failure(): void
    {
        Option::set('telegram_bot_proxies', [
            'http://proxy-one.test:8080',
            'socks5h://proxy-two.test:1080',
        ], 'notifications');

        $attempted = [];

        Http::fake(function (Request $request) use (&$attempted) {
            $attempted[] = $request->attributes()['telegram_proxy_fingerprint'] ?? null;

            if (count($attempted) === 1) {
                return Http::failedConnection('Proxy is unreachable.');
            }

            return Http::response([
                'ok' => true,
                'result' => ['message_id' => 92],
            ]);
        });

        $result = app(TelegramGateway::class)->sendToChat('778899', 'متن اعلان');

        $this->assertTrue($result->successful);
        $this->assertCount(2, $attempted);
        $this->assertNotSame($attempted[0], $attempted[1]);
        $this->assertCount(2, $result->payload['attempts']);
    }

    public function test_it_uses_direct_fallback_only_when_explicitly_enabled(): void
    {
        Option::set('telegram_bot_proxies', ['http://proxy-one.test:8080'], 'notifications');
        Option::set('telegram_bot_direct_fallback_enabled', '1', 'notifications');

        $transports = [];

        Http::fake(function (Request $request) use (&$transports) {
            $transport = $request->attributes()['telegram_transport'] ?? null;
            $transports[] = $transport;

            return $transport === 'proxy'
                ? Http::failedConnection('Proxy is unreachable.')
                : Http::response(['ok' => true, 'result' => ['message_id' => 93]]);
        });

        $result = app(TelegramGateway::class)->sendToChat('778899', 'متن اعلان');

        $this->assertTrue($result->successful);
        $this->assertSame(['proxy', 'direct'], $transports);
        $this->assertSame('direct', $result->payload['transport']);
    }

    public function test_it_does_not_rotate_for_a_non_transport_telegram_error(): void
    {
        Option::set('telegram_bot_proxies', [
            'http://proxy-one.test:8080',
            'http://proxy-two.test:8080',
        ], 'notifications');

        Http::fake([
            '*' => Http::response([
                'ok' => false,
                'error_code' => 401,
                'description' => 'Unauthorized',
            ], 401),
        ]);

        $result = app(TelegramGateway::class)->sendToChat('778899', 'متن اعلان');

        $this->assertFalse($result->successful);
        $this->assertSame('401', $result->errorCode);
        $this->assertFalse($result->retryable);
        $this->assertCount(1, $result->payload['attempts']);
        Http::assertSentCount(1);
    }

    public function test_it_requires_a_proxy_when_proxy_mode_is_enabled_and_direct_fallback_is_disabled(): void
    {
        Option::set('telegram_bot_proxies', [], 'notifications');
        Http::fake();

        $result = app(TelegramGateway::class)->sendToChat('778899', 'متن اعلان');

        $this->assertFalse($result->successful);
        $this->assertSame('provider_not_configured', $result->errorCode);
        $this->assertFalse($result->retryable);
        Http::assertNothingSent();
    }

    public function test_it_sends_to_the_configured_legal_questions_channel(): void
    {
        Option::set('legal_questions_channel_telegram_chat_id', '-1002303257757', 'notifications');
        Option::set('telegram_bot_proxy_enabled', '0', 'notifications');

        Http::fake([
            '*' => Http::response(['ok' => true, 'result' => ['message_id' => 156]]),
        ]);

        $result = app(TelegramGateway::class)->sendToLegalQuestionsChannel('پرسش حقوقی جدید');

        $this->assertTrue($result->successful);
        Http::assertSent(fn (Request $request): bool =>
            $request['chat_id'] === '-1002303257757'
            && $request['text'] === 'پرسش حقوقی جدید'
        );
    }

    public function test_it_sends_to_the_default_configured_channel(): void
    {
        Option::set('telegram_bot_default_chat_id', '@dadlinenet', 'notifications');
        Option::set('telegram_bot_proxy_enabled', '0', 'notifications');

        Http::fake([
            '*' => Http::response(['ok' => true, 'result' => ['message_id' => 94]]),
        ]);

        $result = app(TelegramGateway::class)->sendToDefaultChat('پیام کانال عمومی');

        $this->assertTrue($result->successful);
        Http::assertSent(fn (Request $request): bool =>
            $request['chat_id'] === '@dadlinenet'
            && $request['text'] === 'پیام کانال عمومی'
        );
    }

    public function test_it_sends_through_the_cloudflare_relay_without_a_local_bot_token(): void
    {
        Option::set('telegram_bot_token', '', 'notifications');
        Option::set('telegram_bot_relay_enabled', '1', 'notifications');
        Option::set(
            'telegram_bot_relay_url',
            'https://dadline-telegram-relay.workers.dev/v1/telegram/sendMessage',
            'notifications',
        );
        Option::set('telegram_bot_relay_secret', 'relay-shared-secret', 'notifications');

        Http::fake(function (Request $request) {
            $timestamp = $request->header('X-Dadline-Relay-Timestamp')[0] ?? '';
            $expectedSignature = 'sha256='.hash_hmac(
                'sha256',
                $timestamp.'.'.$request->body(),
                'relay-shared-secret',
            );

            $this->assertSame('relay', $request->attributes()['telegram_transport'] ?? null);
            $this->assertSame(
                'https://dadline-telegram-relay.workers.dev/v1/telegram/sendMessage',
                $request->url(),
            );
            $this->assertSame('1', $request->header('X-Dadline-Relay-Version')[0] ?? null);
            $this->assertSame($expectedSignature, $request->header('X-Dadline-Relay-Signature')[0] ?? null);

            return Http::response([
                'ok' => true,
                'result' => [
                    'message_id' => 96,
                    'chat' => ['id' => -100123456],
                ],
            ], 200, [
                'X-Dadline-Relay-Request-Id' => 'relay-request-96',
            ]);
        });

        $result = app(TelegramGateway::class)->sendToChat('@dadlinenet', 'پیام از Cloudflare');

        $this->assertTrue($result->successful);
        $this->assertSame('relay', $result->payload['transport']);
        $this->assertSame('relay-request-96', $result->payload['relay_request_id']);
        $this->assertSame('relay', $result->payload['attempts'][0]['transport']);
    }

    public function test_it_falls_back_from_the_relay_to_a_proxy_only_when_enabled(): void
    {
        Option::set('telegram_bot_relay_enabled', '1', 'notifications');
        Option::set(
            'telegram_bot_relay_url',
            'https://dadline-telegram-relay.workers.dev/v1/telegram/sendMessage',
            'notifications',
        );
        Option::set('telegram_bot_relay_secret', 'relay-shared-secret', 'notifications');
        Option::set('telegram_bot_relay_fallback_enabled', '1', 'notifications');
        Option::set('telegram_bot_proxies', ['http://proxy-one.test:8080'], 'notifications');

        $transports = [];

        Http::fake(function (Request $request) use (&$transports) {
            $transport = $request->attributes()['telegram_transport'] ?? null;
            $transports[] = $transport;

            return $transport === 'relay'
                ? Http::response([
                    'ok' => false,
                    'error_code' => 502,
                    'description' => 'Telegram upstream is unavailable.',
                ], 502)
                : Http::response(['ok' => true, 'result' => ['message_id' => 97]]);
        });

        $result = app(TelegramGateway::class)->sendToChat('778899', 'پیام fallback');

        $this->assertTrue($result->successful);
        $this->assertSame(['relay', 'proxy'], $transports);
        $this->assertSame('proxy', $result->payload['transport']);
        $this->assertCount(2, $result->payload['attempts']);
    }

    public function test_it_rejects_an_enabled_relay_without_a_shared_secret(): void
    {
        Option::set('telegram_bot_relay_enabled', '1', 'notifications');
        Option::set(
            'telegram_bot_relay_url',
            'https://dadline-telegram-relay.workers.dev/v1/telegram/sendMessage',
            'notifications',
        );
        Option::set('telegram_bot_relay_secret', '', 'notifications');
        Http::fake();

        $result = app(TelegramGateway::class)->sendToChat('778899', 'پیام تست');

        $this->assertFalse($result->successful);
        $this->assertSame('provider_not_configured', $result->errorCode);
        $this->assertStringContainsString('telegram_bot_relay_secret', (string) $result->errorMessage);
        Http::assertNothingSent();
    }

    public function test_notification_manager_uses_the_real_telegram_channel(): void
    {
        $driver = app(NotificationChannelManager::class)->driver(NotificationChannel::Telegram);

        $this->assertInstanceOf(TelegramNotificationChannel::class, $driver);
    }

    public function test_telegram_notification_channel_uses_delivery_recipient_and_body(): void
    {
        Option::set('telegram_bot_proxy_enabled', '0', 'notifications');

        Http::fake([
            '*' => Http::response(['ok' => true, 'result' => ['message_id' => 95]]),
        ]);

        $delivery = new NotificationDelivery([
            'channel' => NotificationChannel::Telegram,
            'recipient' => '778899',
            'body' => 'متن اعلان',
        ]);

        $result = app(TelegramNotificationChannel::class)->send($delivery);

        $this->assertTrue($result->successful);
        Http::assertSent(fn (Request $request): bool =>
            $request['chat_id'] === '778899'
            && $request['text'] === 'متن اعلان'
        );
    }
}
