<?php

namespace Tests\Unit;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\NotificationTemplate;
use App\Models\Option;
use App\Services\Notifications\NotificationChannelManager;
use App\Services\Notifications\Providers\MeliPayamakPatternProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MeliPayamakPatternProviderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Option::set('sms_provider_mode', 'smart', 'notifications');
        Option::set('sms_otp_pattern_fallback_enabled', '1', 'notifications');
        Option::set('melipayamak_enabled', '1', 'notifications');
        Option::set('melipayamak_username', 'dadline-user', 'notifications');
        Option::set('melipayamak_api_key', 'dadline-api-key', 'notifications');
        Option::set('melipayamak_password', 'legacy-password', 'notifications');
        Option::set('melipayamak_send_by_base_number_url', 'http://api.payamak-panel.com/post/Send.asmx', 'notifications');
        Option::set('melipayamak_timeout_seconds', '20', 'notifications');
        Option::set('melipayamak_connect_timeout_seconds', '5', 'notifications');
    }

    public function test_it_sends_pattern_variables_in_template_order_and_returns_rec_id(): void
    {
        Http::fake([
            'http://api.payamak-panel.com/post/Send.asmx' => Http::response(
                $this->soapResponse('1234567890123456'),
                200,
                ['Content-Type' => 'text/xml; charset=utf-8'],
            ),
        ]);

        $delivery = $this->delivery(
            templateKey: 'auth.otp.sms',
            variables: ['code'],
            payload: ['code' => '654321'],
            bodyId: 315973,
        );

        $result = app(MeliPayamakPatternProvider::class)->send($delivery);

        $this->assertTrue($result->successful);
        $this->assertSame('melipayamak', $result->provider);
        $this->assertSame('1234567890123456', $result->messageId);
        $this->assertSame(315973, $result->payload['body_id']);

        Http::assertSent(function (Request $request): bool {
            $body = $request->body();

            return $request->url() === 'http://api.payamak-panel.com/post/Send.asmx'
                && $request->method() === 'POST'
                && $request->hasHeader('SOAPAction', '"http://tempuri.org/SendByBaseNumber"')
                && str_contains($body, '<username>dadline-user</username>')
                && str_contains($body, '<password>dadline-api-key</password>')
                && str_contains($body, '<text><string>654321</string></text>')
                && str_contains($body, '<to>09121234567</to>')
                && str_contains($body, '<bodyId>315973</bodyId>');
        });
    }

    public function test_it_maps_documented_pattern_errors(): void
    {
        Http::fake([
            'http://api.payamak-panel.com/post/Send.asmx' => Http::response(
                $this->soapResponse('-4'),
                200,
                ['Content-Type' => 'text/xml; charset=utf-8'],
            ),
        ]);

        $result = app(MeliPayamakPatternProvider::class)->send($this->delivery());

        $this->assertFalse($result->successful);
        $this->assertSame('-4', $result->errorCode);
        $this->assertFalse($result->retryable);
        $this->assertStringContainsString('پترن', (string) $result->errorMessage);
    }

    public function test_it_is_disabled_when_adly_only_mode_is_selected(): void
    {
        Option::set('sms_provider_mode', 'adly', 'notifications');

        $this->assertFalse(
            app(MeliPayamakPatternProvider::class)->supports($this->delivery()),
        );
    }

    public function test_otp_falls_back_from_api_ir_to_melipayamak_even_for_a_non_retryable_rejection(): void
    {
        Option::set('api_ir_enabled', '1', 'external_services');
        Option::set('api_ir_base_url', 'https://p.api.ir', 'external_services');
        Option::set('api_ir_api_key', 'api-ir-key', 'external_services');
        Option::set('api_ir_sms_otp_enabled', '1', 'external_services');
        Option::set('api_ir_sms_otp_endpoint', '/api/sw1/SmsOTP', 'external_services');
        Option::set('api_ir_sms_otp_template', '1', 'external_services');

        Http::fake([
            'https://p.api.ir/api/sw1/SmsOTP' => Http::response([
                'success' => false,
                'code' => 401,
                'message' => 'دسترسی رد شد',
                'data' => null,
            ]),
            'http://api.payamak-panel.com/post/Send.asmx' => Http::response(
                $this->soapResponse('9876543210123456'),
                200,
                ['Content-Type' => 'text/xml; charset=utf-8'],
            ),
        ]);

        $result = app(NotificationChannelManager::class)
            ->driver(NotificationChannel::Sms)
            ->send($this->delivery());

        $this->assertTrue($result->successful);
        $this->assertSame('melipayamak', $result->provider);
        $this->assertSame(
            ['api_ir_sms_otp', 'melipayamak'],
            collect($result->payload['attempts'])->pluck('provider')->all(),
        );
        Http::assertSentCount(2);
    }

    /**
     * @param  array<int, string>  $variables
     * @param  array<string, mixed>  $payload
     */
    private function delivery(
        string $templateKey = 'auth.otp.sms',
        array $variables = ['code'],
        array $payload = ['code' => '123456'],
        int $bodyId = 315973,
    ): NotificationDelivery {
        NotificationTemplate::query()->create([
            'key' => $templateKey,
            'channel' => NotificationChannel::Sms,
            'title' => 'پیامک پترن',
            'body' => 'کد: {{ code }}',
            'variables' => $variables,
            'provider_patterns' => [
                'melipayamak' => ['id' => $bodyId],
                'adly' => ['id' => 1209],
            ],
            'category' => NotificationCategory::Auth,
            'priority' => NotificationPriority::Critical,
            'is_critical' => true,
            'is_active' => true,
            'quiet_hours_enabled' => false,
            'dedupe_window_minutes' => 2,
        ]);

        $notification = Notification::query()->create([
            'template_key' => $templateKey,
            'event_key' => $templateKey,
            'channel' => NotificationChannel::Database,
            'recipient' => '09121234567',
            'payload' => $payload,
            'category' => NotificationCategory::Auth,
            'priority' => NotificationPriority::Critical,
            'is_critical' => true,
            'status' => NotificationStatus::Pending,
        ]);

        return $notification->deliveries()->create([
            'channel' => NotificationChannel::Sms,
            'recipient' => '+989121234567',
            'body' => 'کد: '.($payload['code'] ?? ''),
            'payload' => $payload,
            'provider_payload' => [
                'patterns' => [
                    'melipayamak' => ['id' => $bodyId],
                    'adly' => ['id' => 1209],
                ],
            ],
            'status' => 'pending',
        ])->load('notification');
    }

    private function soapResponse(string $value): string
    {
        return '<?xml version="1.0" encoding="utf-8"?>'
            .'<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
            .'<soap:Body>'
            .'<SendByBaseNumberResponse xmlns="http://tempuri.org/">'
            .'<SendByBaseNumberResult>'.$value.'</SendByBaseNumberResult>'
            .'</SendByBaseNumberResponse>'
            .'</soap:Body>'
            .'</soap:Envelope>';
    }
}
