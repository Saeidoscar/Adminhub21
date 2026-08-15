<?php

namespace Tests\Unit;

use App\Enums\NotificationChannel;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\Option;
use App\Services\Notifications\BaleGateway;
use App\Services\Notifications\Channels\BaleNotificationChannel;
use App\Services\Notifications\NotificationChannelManager;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BaleGatewayTest extends TestCase
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

    public function test_it_validates_the_configured_bot_token(): void
    {
        Option::set('bale_bot_token', '123456:bot-secret', 'notifications');

        Http::fake([
            'https://tapi.bale.ai/bot123456:bot-secret/getMe' => Http::response([
                'ok' => true,
                'result' => [
                    'id' => 123456,
                    'is_bot' => true,
                    'username' => 'dadline_bot',
                ],
            ]),
        ]);

        $result = app(BaleGateway::class)->getBotInfo();

        $this->assertTrue($result->successful);
        $this->assertSame('bale-bot-api', $result->provider);
        $this->assertSame(123456, data_get($result->payload, 'response.result.id'));
        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://tapi.bale.ai/bot123456:bot-secret/getMe'
            && $request->method() === 'GET'
        );
    }

    public function test_it_sends_to_the_configured_legal_questions_channel(): void
    {
        Option::set('bale_bot_enabled', '1', 'notifications');
        Option::set('bale_bot_token', '123456:bot-secret', 'notifications');
        Option::set('legal_questions_channel_bale_chat_id', '@legal_question', 'notifications');

        Http::fake([
            'https://tapi.bale.ai/bot123456:bot-secret/sendMessage' => Http::response([
                'ok' => true,
                'result' => [
                    'message_id' => 77,
                    'chat' => ['id' => -100778899],
                ],
            ]),
        ]);

        $result = app(BaleGateway::class)->sendToLegalQuestionsChannel('پرسش حقوقی جدید');

        $this->assertTrue($result->successful);
        $this->assertSame('77', $result->messageId);

        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://tapi.bale.ai/bot123456:bot-secret/sendMessage'
            && $request['chat_id'] === '@legal_question'
            && $request['text'] === 'پرسش حقوقی جدید'
            && str_contains((string) $request->header('Content-Type')[0], 'application/json')
        );
    }

    public function test_it_sends_an_otp_through_safir_with_a_stable_request_id(): void
    {
        Option::set('bale_safir_enabled', '1', 'notifications');
        Option::set('bale_safir_api_access_key', 'safir-access-key', 'notifications');
        Option::set('bale_safir_bot_id', '987654', 'notifications');

        Http::fake([
            'https://safir.bale.ai/api/v3/send_message' => Http::response([
                'message_id' => 'safir-message-1',
                'error_data' => null,
            ]),
        ]);

        $result = app(BaleGateway::class)->sendOtpToPhone(
            phoneNumber: '09121234567',
            otp: '123456',
            requestId: 'notification-delivery-15',
        );

        $this->assertTrue($result->successful);
        $this->assertSame('bale-safir', $result->provider);
        $this->assertSame('safir-message-1', $result->messageId);

        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://safir.bale.ai/api/v3/send_message'
            && $request->header('api-access-key')[0] === 'safir-access-key'
            && $request['request_id'] === 'notification-delivery-15'
            && $request['bot_id'] === 987654
            && $request['phone_number'] === '989121234567'
            && data_get($request->data(), 'message_data.otp_message.otp') === '123456'
        );
    }

    public function test_it_maps_safir_errors_and_marks_rate_limits_retryable(): void
    {
        Option::set('bale_safir_enabled', '1', 'notifications');
        Option::set('bale_safir_api_access_key', 'safir-access-key', 'notifications');
        Option::set('bale_safir_bot_id', '987654', 'notifications');

        Http::fake([
            'https://safir.bale.ai/api/v3/send_message' => Http::response([
                'message_id' => null,
                'error_data' => [[
                    'phone_number' => '989121234567',
                    'code' => 3,
                    'description' => 'Rate limit exceeded',
                ]],
            ]),
        ]);

        $result = app(BaleGateway::class)->sendToPhone('09121234567', 'پیام تست');

        $this->assertFalse($result->successful);
        $this->assertSame('3', $result->errorCode);
        $this->assertTrue($result->retryable);
    }

    public function test_it_fails_without_calling_bale_when_required_options_are_missing(): void
    {
        Option::set('bale_bot_enabled', '1', 'notifications');
        Option::set('legal_questions_channel_bale_chat_id', '@legal_question', 'notifications');
        Http::fake();

        $result = app(BaleGateway::class)->sendToLegalQuestionsChannel('پیام');

        $this->assertFalse($result->successful);
        $this->assertSame('provider_not_configured', $result->errorCode);
        $this->assertFalse($result->retryable);
        Http::assertNothingSent();
    }

    public function test_notification_manager_uses_the_real_bale_channel(): void
    {
        $driver = app(NotificationChannelManager::class)->driver(NotificationChannel::Bale);

        $this->assertInstanceOf(BaleNotificationChannel::class, $driver);
    }

    public function test_bale_notification_channel_sends_bot_link_recipients_with_the_bot_api(): void
    {
        Option::set('bale_bot_enabled', '1', 'notifications');
        Option::set('bale_bot_token', '123456:bot-secret', 'notifications');

        Http::fake([
            'https://tapi.bale.ai/bot123456:bot-secret/sendMessage' => Http::response([
                'ok' => true,
                'result' => ['message_id' => 90],
            ]),
        ]);

        $delivery = new NotificationDelivery([
            'channel' => NotificationChannel::Bale,
            'recipient' => '778899',
            'body' => 'متن اعلان',
        ]);

        $result = app(BaleNotificationChannel::class)->send($delivery);

        $this->assertTrue($result->successful);
        Http::assertSent(fn (Request $request): bool =>
            $request['chat_id'] === 778899
            && $request['text'] === 'متن اعلان'
        );
    }

    public function test_bale_notification_channel_uses_safir_otp_for_mobile_recipients(): void
    {
        Option::set('bale_safir_enabled', '1', 'notifications');
        Option::set('bale_safir_api_access_key', 'safir-access-key', 'notifications');
        Option::set('bale_safir_bot_id', '987654', 'notifications');

        Http::fake([
            'https://safir.bale.ai/api/v3/send_message' => Http::response([
                'message_id' => 'otp-message-1',
                'error_data' => null,
            ]),
        ]);

        $notification = new Notification(['template_key' => 'auth.otp.sms']);
        $delivery = new NotificationDelivery([
            'channel' => NotificationChannel::Bale,
            'recipient' => '09121234567',
            'body' => 'کد ورود دادلاین: 123456',
            'payload' => ['code' => '123456'],
        ]);
        $delivery->setRelation('notification', $notification);

        $result = app(BaleNotificationChannel::class)->send($delivery);

        $this->assertTrue($result->successful);
        $this->assertSame('bale-safir', $result->provider);
        Http::assertSent(fn (Request $request): bool =>
            data_get($request->data(), 'message_data.otp_message.otp') === '123456'
            && $request['phone_number'] === '989121234567'
        );
    }
}
