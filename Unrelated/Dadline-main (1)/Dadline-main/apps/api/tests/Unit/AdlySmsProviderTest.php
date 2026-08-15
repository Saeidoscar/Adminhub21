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
use App\Services\Notifications\Providers\AdlySmsProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdlySmsProviderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Option::set('sms_provider_mode', 'adly', 'notifications');
        Option::set('sms_otp_pattern_fallback_enabled', '1', 'notifications');
        Option::set('adly_enabled', '1', 'notifications');
        Option::set('adly_api_url', 'https://mydnspanel.com/webservice/server', 'notifications');
        Option::set('adly_api_key', 'adly-api-key', 'notifications');
        Option::set('adly_sender', '9850004988', 'notifications');
        Option::set('adly_pattern_sender', '9850009880000', 'notifications');
        Option::set('adly_timeout_seconds', '20', 'notifications');
        Option::set('adly_connect_timeout_seconds', '5', 'notifications');
    }

    public function test_it_sends_a_pattern_message_with_documented_form_fields(): void
    {
        Http::fake([
            'https://mydnspanel.com/webservice/server' => Http::response([
                'success' => true,
                'sendID' => 'adly-pattern-1001',
            ]),
        ]);

        $result = app(AdlySmsProvider::class)->send($this->delivery(
            variables: ['name', 'code'],
            payload: ['name' => 'فرهاد', 'code' => '654321'],
            patternId: 1209,
        ));

        $this->assertTrue($result->successful);
        $this->assertSame('adly', $result->provider);
        $this->assertSame('adly-pattern-1001', $result->messageId);
        $this->assertSame('pattern', $result->payload['transport']);
        $this->assertSame(1209, $result->payload['pattern_id']);

        Http::assertSent(function (Request $request): bool {
            $data = $this->multipartData($request);
            $textData = json_decode((string) ($data['textData'] ?? ''), true);

            return $request->url() === 'https://mydnspanel.com/webservice/server'
                && $request->method() === 'POST'
                && $request->hasHeader('Authorization', 'adly-api-key')
                && str_contains((string) $request->header('Content-Type')[0], 'multipart/form-data')
                && ($data['action'] ?? null) === 'sendServices'
                && ($data['from'] ?? null) === '9850009880000'
                && ($data['textCode'] ?? null) === '1209'
                && ($data['receivers'] ?? null) === '989121234567'
                && $textData === [
                    '{name}' => 'فرهاد',
                    '{code}' => '654321',
                ];
        });
    }

    public function test_it_sends_the_rendered_body_as_a_simple_message_when_no_pattern_exists(): void
    {
        Http::fake([
            'https://mydnspanel.com/webservice/server' => Http::response([
                'ok' => true,
                'data' => ['id' => 884422],
            ]),
        ]);

        $result = app(AdlySmsProvider::class)->send($this->delivery(
            body: 'پیام ساده دادلاین برای فرهاد',
            patternId: null,
        ));

        $this->assertTrue($result->successful);
        $this->assertSame('884422', $result->messageId);
        $this->assertSame('simple', $result->payload['transport']);

        Http::assertSent(function (Request $request): bool {
            $data = $this->multipartData($request);

            return ($data['action'] ?? null) === 'send'
                && ($data['from'] ?? null) === '9850004988'
                && ($data['text'] ?? null) === 'پیام ساده دادلاین برای فرهاد'
                && ($data['receivers'] ?? null) === '989121234567'
                && ! array_key_exists('textCode', $data)
                && ! array_key_exists('textData', $data);
        });
    }

    public function test_it_uses_pattern_variables_configured_for_adly(): void
    {
        Http::fake([
            'https://mydnspanel.com/webservice/server' => Http::response('9988776655'),
        ]);

        $delivery = $this->delivery(
            variables: ['ignored'],
            payload: ['code' => '778899', 'ignored' => 'value'],
            patternId: 1209,
            providerVariables: ['{code}'],
        );

        $result = app(AdlySmsProvider::class)->send($delivery);

        $this->assertTrue($result->successful);
        $this->assertSame('9988776655', $result->messageId);

        Http::assertSent(function (Request $request): bool {
            $data = $this->multipartData($request);

            return json_decode((string) ($data['textData'] ?? ''), true) === [
                '{code}' => '778899',
            ];
        });
    }

    public function test_smart_mode_falls_back_from_melipayamak_to_adly(): void
    {
        Option::set('sms_provider_mode', 'smart', 'notifications');
        Option::set('api_ir_enabled', '0', 'external_services');
        Option::set('melipayamak_enabled', '1', 'notifications');
        Option::set('melipayamak_username', 'dadline-user', 'notifications');
        Option::set('melipayamak_api_key', 'dadline-api-key', 'notifications');
        Option::set('melipayamak_send_by_base_number_url', 'http://api.payamak-panel.com/post/Send.asmx', 'notifications');

        Http::fake([
            'http://api.payamak-panel.com/post/Send.asmx' => Http::response(
                $this->soapResponse('-4'),
                200,
                ['Content-Type' => 'text/xml; charset=utf-8'],
            ),
            'https://mydnspanel.com/webservice/server' => Http::response([
                'success' => true,
                'sendID' => 'adly-fallback-2002',
            ]),
        ]);

        $result = app(NotificationChannelManager::class)
            ->driver(NotificationChannel::Sms)
            ->send($this->delivery(patternId: 1209, melipayamakBodyId: 315973));

        $this->assertTrue($result->successful);
        $this->assertSame('adly', $result->provider);
        $this->assertSame(
            ['melipayamak', 'adly'],
            collect($result->payload['attempts'])->pluck('provider')->all(),
        );
    }

    public function test_smart_mode_uses_adly_simple_send_when_no_provider_pattern_exists(): void
    {
        Option::set('sms_provider_mode', 'smart', 'notifications');
        Option::set('api_ir_enabled', '0', 'external_services');
        Option::set('melipayamak_enabled', '1', 'notifications');
        Option::set('melipayamak_username', 'dadline-user', 'notifications');
        Option::set('melipayamak_api_key', 'dadline-api-key', 'notifications');

        Http::fake([
            'https://mydnspanel.com/webservice/server' => Http::response([
                'success' => true,
                'sendID' => 'adly-simple-fallback-3003',
            ]),
        ]);

        $result = app(NotificationChannelManager::class)
            ->driver(NotificationChannel::Sms)
            ->send($this->delivery(
                body: 'پیام بدون پترن دادلاین',
                patternId: null,
                melipayamakBodyId: null,
            ));

        $this->assertTrue($result->successful);
        $this->assertSame('adly', $result->provider);
        $this->assertSame('simple', $result->payload['transport']);
        $this->assertSame(
            ['melipayamak', 'adly'],
            collect($result->payload['attempts'])->pluck('provider')->all(),
        );

        Http::assertSent(function (Request $request): bool {
            $data = $this->multipartData($request);

            return ($data['action'] ?? null) === 'send'
                && ($data['text'] ?? null) === 'پیام بدون پترن دادلاین';
        });
    }

    public function test_it_maps_an_explicit_provider_rejection(): void
    {
        Http::fake([
            'https://mydnspanel.com/webservice/server' => Http::response([
                'success' => false,
                'code' => 'invalid_pattern',
                'message' => 'Pattern is not valid.',
            ]),
        ]);

        $result = app(AdlySmsProvider::class)->send($this->delivery());

        $this->assertFalse($result->successful);
        $this->assertSame('invalid_pattern', $result->errorCode);
        $this->assertSame('Pattern is not valid.', $result->errorMessage);
        $this->assertFalse($result->retryable);
    }

    /**
     * @param  array<int, string>  $variables
     * @param  array<string, mixed>  $payload
     * @param  array<int, string>|null  $providerVariables
     */
    private function delivery(
        string $templateKey = 'auth.otp.sms',
        array $variables = ['code'],
        array $payload = ['code' => '123456'],
        string $body = 'کد تایید دادلاین: 123456',
        ?int $patternId = 1209,
        ?int $melipayamakBodyId = 315973,
        ?array $providerVariables = null,
    ): NotificationDelivery {
        $adlyPattern = $patternId === null ? [] : ['id' => $patternId];

        if ($providerVariables !== null) {
            $adlyPattern['variables'] = $providerVariables;
        }

        NotificationTemplate::query()->create([
            'key' => $templateKey,
            'channel' => NotificationChannel::Sms,
            'title' => 'پیامک دادلاین',
            'body' => $body,
            'variables' => $variables,
            'provider_patterns' => [
                'melipayamak' => ['id' => $melipayamakBodyId],
                'adly' => $adlyPattern,
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
            'body' => $body,
            'payload' => $payload,
            'provider_payload' => [
                'patterns' => [
                    'melipayamak' => ['id' => $melipayamakBodyId],
                    'adly' => $adlyPattern,
                ],
            ],
            'status' => 'pending',
        ])->load('notification');
    }

    /**
     * Laravel records multipart fields as a list of name/contents pairs.
     *
     * @return array<string, mixed>
     */
    private function multipartData(Request $request): array
    {
        $data = $request->data();

        if (! array_is_list($data)) {
            return $data;
        }

        return collect($data)
            ->filter(fn (mixed $part): bool => is_array($part) && array_key_exists('name', $part))
            ->mapWithKeys(fn (array $part): array => [
                (string) $part['name'] => $part['contents'] ?? null,
            ])
            ->all();
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
