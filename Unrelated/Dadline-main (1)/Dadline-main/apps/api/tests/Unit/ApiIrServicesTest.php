<?php

namespace Tests\Unit;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use App\Models\ExternalServiceRequest;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\Option;
use App\Services\ExternalServices\ApiIr\ApiIrIdentityVerificationProvider;
use App\Services\ExternalServices\Contracts\IdentityVerificationProvider;
use App\Services\ExternalServices\Data\ExternalVerificationResult;
use App\Services\ExternalServices\Exceptions\ExternalServiceException;
use App\Services\ExternalServices\IdentityVerificationManager;
use App\Services\Notifications\Providers\ApiIrCallOtpProvider;
use App\Services\Notifications\Providers\ApiIrSmsOtpProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ApiIrServicesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Option::set('api_ir_enabled', '1', 'external_services');
        Option::set('api_ir_base_url', 'https://p.api.ir', 'external_services');
        Option::set('api_ir_api_key', 'secret-api-key', 'external_services');
        Option::set('api_ir_identity_enabled', '1', 'external_services');
        Option::set('api_ir_level_one_lite_enabled', '1', 'external_services');
        Option::set('api_ir_level_one_lite_endpoint', '/api/sw1/ShahkarLite', 'external_services');
        Option::set('api_ir_level_one_pro_enabled', '1', 'external_services');
        Option::set('api_ir_level_one_pro_endpoint', '/api/sw1/ShahkarPro', 'external_services');
        Option::set('api_ir_sms_otp_enabled', '1', 'external_services');
        Option::set('api_ir_sms_otp_endpoint', '/api/sw1/SmsOTP', 'external_services');
        Option::set('api_ir_sms_otp_template', '1', 'external_services');
        Option::set('api_ir_call_otp_enabled', '1', 'external_services');
        Option::set('api_ir_call_otp_endpoint', '/api/sw1/CallOTP', 'external_services');
        Option::set('api_ir_call_otp_alt_enabled', '1', 'external_services');
        Option::set('api_ir_call_otp_alt_endpoint', '/api/sw1/CallOTPalt', 'external_services');
        Option::set('api_ir_non_billable_http_statuses', '401,403,404,405,408,429,500,502,503,504', 'external_services');
        Option::set('api_ir_non_billable_codes', '401,403,408,429,500,502,503,504', 'external_services');
    }

    public function test_level_one_negative_business_response_is_billable(): void
    {
        Http::fake([
            'p.api.ir/api/sw1/ShahkarLite' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'عدم تطابق',
                'data' => false,
            ]),
        ]);

        $result = app(ApiIrIdentityVerificationProvider::class)->verifyLevelOne(
            nationalCode: '1000000001',
            mobile: '09120000000',
            userId: null,
        );

        $this->assertFalse($result->matched);
        $this->assertTrue($result->billable);
        $this->assertNotNull($result->requestId);
        $this->assertSame('shahkar_lite', $result->data['source']);

        $requestLog = ExternalServiceRequest::sole();
        $this->assertTrue($requestLog->billable);
        $this->assertSame('succeeded', $requestLog->status);
        $this->assertNull($requestLog->billed_at);

        Http::assertSentCount(1);
        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://p.api.ir/api/sw1/ShahkarLite'
                && $request->hasHeader('Authorization', 'Bearer secret-api-key')
                && $request['nationalCode'] === '1000000001'
                && $request['mobile'] === '09120000000'
                && ! isset($request['isCompany']);
        });
    }

    public function test_definitive_business_rejection_with_422_status_is_billable(): void
    {
        Http::fake([
            'p.api.ir/api/sw1/ShahkarLite' => Http::response([
                'success' => false,
                'code' => 0,
                'message' => 'اطلاعات ورودی مطابقت ندارد',
                'data' => false,
            ], 422),
        ]);

        $result = app(ApiIrIdentityVerificationProvider::class)->verifyLevelOne(
            nationalCode: '1000000001',
            mobile: '09120000000',
        );

        $this->assertFalse($result->matched);
        $this->assertTrue($result->billable);
        $this->assertSame(422, ExternalServiceRequest::sole()->http_status);
    }

    public function test_level_one_falls_back_to_shahkar_pro_after_lite_technical_failure(): void
    {
        Http::fake([
            'p.api.ir/api/sw1/ShahkarLite' => Http::response([
                'success' => false,
                'code' => 503,
                'message' => 'شبکه Lite در دسترس نیست',
                'data' => null,
            ]),
            'p.api.ir/api/sw1/ShahkarPro' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'تطابق دارد',
                'data' => true,
            ]),
        ]);

        $result = app(ApiIrIdentityVerificationProvider::class)->verifyLevelOne(
            nationalCode: '1000000001',
            mobile: '09120000000',
        );

        $this->assertTrue($result->matched);
        $this->assertTrue($result->billable);
        $this->assertSame('shahkar_pro', $result->data['source']);
        $this->assertSame(2, ExternalServiceRequest::query()->count());

        $logs = ExternalServiceRequest::query()->orderBy('id')->get();
        $this->assertSame('identity.level_one.shahkar_lite', $logs[0]->service);
        $this->assertSame('failed', $logs[0]->status);
        $this->assertFalse($logs[0]->billable);
        $this->assertSame('identity.level_one.shahkar_pro', $logs[1]->service);
        $this->assertSame('succeeded', $logs[1]->status);
        $this->assertTrue($logs[1]->billable);

        Http::assertSentCount(2);
        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://p.api.ir/api/sw1/ShahkarPro'
                && $request['nationalCode'] === '1000000001'
                && $request['mobile'] === '09120000000'
                && $request['isCompany'] === false;
        });
    }

    public function test_level_one_uses_shahkar_pro_directly_when_lite_is_disabled(): void
    {
        Option::set('api_ir_level_one_lite_enabled', '0', 'external_services');

        Http::fake([
            'p.api.ir/api/sw1/ShahkarPro' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'تطابق دارد',
                'data' => true,
            ]),
        ]);

        $result = app(ApiIrIdentityVerificationProvider::class)->verifyLevelOne(
            nationalCode: '1000000001',
            mobile: '09120000000',
        );

        $this->assertTrue($result->matched);
        $this->assertSame('shahkar_pro', $result->data['source']);
        Http::assertSentCount(1);
        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://p.api.ir/api/sw1/ShahkarPro'
            && $request['isCompany'] === false);
    }

    public function test_level_one_throws_when_lite_and_pro_both_fail_technically(): void
    {
        Http::fake([
            'p.api.ir/api/sw1/ShahkarLite' => Http::response([
                'success' => false,
                'code' => 503,
                'message' => 'شبکه Lite در دسترس نیست',
                'data' => null,
            ]),
            'p.api.ir/api/sw1/ShahkarPro' => Http::response([
                'success' => false,
                'code' => 503,
                'message' => 'شبکه Pro در دسترس نیست',
                'data' => null,
            ]),
        ]);

        try {
            app(ApiIrIdentityVerificationProvider::class)->verifyLevelOne(
                nationalCode: '1000000001',
                mobile: '09120000000',
            );

            $this->fail('Technical API.ir response must throw an exception.');
        } catch (ExternalServiceException $exception) {
            $this->assertTrue($exception->retryable);
            $this->assertSame('503', $exception->errorCode);
            $this->assertSame('identity.level_one.shahkar_pro', $exception->service);
        }

        $logs = ExternalServiceRequest::query()->orderBy('id')->get();
        $this->assertCount(2, $logs);
        $this->assertTrue($logs->every(fn (ExternalServiceRequest $log): bool => ! $log->billable));
        $this->assertTrue($logs->every(fn (ExternalServiceRequest $log): bool => $log->status === 'failed'));
    }

    public function test_ambiguous_failures_from_lite_and_pro_are_not_billable(): void
    {
        Http::fake([
            'p.api.ir/api/sw1/ShahkarLite' => Http::response([
                'success' => false,
                'message' => 'خطای نامشخص',
                'data' => null,
            ]),
            'p.api.ir/api/sw1/ShahkarPro' => Http::response([
                'success' => false,
                'message' => 'خطای نامشخص',
                'data' => null,
            ]),
        ]);

        $this->expectException(ExternalServiceException::class);

        try {
            app(ApiIrIdentityVerificationProvider::class)->verifyLevelOne(
                nationalCode: '1000000001',
                mobile: '09120000000',
            );
        } finally {
            $logs = ExternalServiceRequest::query()->get();
            $this->assertCount(2, $logs);
            $this->assertTrue($logs->every(fn (ExternalServiceRequest $log): bool => ! $log->billable));
            $this->assertTrue($logs->every(fn (ExternalServiceRequest $log): bool => $log->status === 'failed'));
        }
    }

    public function test_identity_manager_falls_back_after_a_non_retryable_provider_failure(): void
    {
        $primary = new class implements IdentityVerificationProvider
        {
            public function name(): string
            {
                return 'primary';
            }

            public function available(): bool
            {
                return true;
            }

            public function verifyLevelOne(string $nationalCode, string $mobile, ?int $userId = null): ExternalVerificationResult
            {
                throw new ExternalServiceException(
                    message: 'کلید سرویس اصلی معتبر نیست.',
                    provider: 'primary',
                    service: 'identity.level_one',
                    errorCode: '401',
                    retryable: false,
                );
            }

            public function verifyLevelTwo(string $nationalCode, string $birthDate, ?int $userId = null): ExternalVerificationResult
            {
                return $this->verifyLevelOne($nationalCode, '', $userId);
            }
        };

        $fallback = new class implements IdentityVerificationProvider
        {
            public function name(): string
            {
                return 'fallback';
            }

            public function available(): bool
            {
                return true;
            }

            public function verifyLevelOne(string $nationalCode, string $mobile, ?int $userId = null): ExternalVerificationResult
            {
                return new ExternalVerificationResult(
                    matched: true,
                    provider: 'fallback',
                    service: 'identity.level_one',
                );
            }

            public function verifyLevelTwo(string $nationalCode, string $birthDate, ?int $userId = null): ExternalVerificationResult
            {
                return $this->verifyLevelOne($nationalCode, '', $userId);
            }
        };

        $result = (new IdentityVerificationManager([$primary, $fallback]))->verifyLevelOne(
            nationalCode: '1000000001',
            mobile: '09120000000',
        );

        $this->assertTrue($result->matched);
        $this->assertSame('fallback', $result->provider);
    }

    public function test_sms_otp_uses_documented_payload_and_bearer_token(): void
    {
        Http::fake([
            'p.api.ir/api/sw1/SmsOTP' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'ارسال شد',
                'data' => true,
            ]),
        ]);

        $delivery = $this->otpDelivery('auth.otp.sms', NotificationChannel::Sms, '123456');
        $result = app(ApiIrSmsOtpProvider::class)->send($delivery);

        $this->assertTrue($result->successful);

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://p.api.ir/api/sw1/SmsOTP'
                && $request->hasHeader('Authorization', 'Bearer secret-api-key')
                && $request['code'] === '123456'
                && $request['mobile'] === '09120000000'
                && $request['template'] === 1;
        });

        $this->assertSame('[REDACTED]', ExternalServiceRequest::sole()->request_payload['code']);
    }

    public function test_contract_signature_otp_is_sent_through_api_ir(): void
    {
        Http::fake([
            'p.api.ir/api/sw1/SmsOTP' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'ارسال شد',
                'data' => true,
            ]),
        ]);

        $delivery = $this->otpDelivery(
            'contract.signature_otp.sms',
            NotificationChannel::Sms,
            '432198',
        );
        $result = app(ApiIrSmsOtpProvider::class)->send($delivery);

        $this->assertTrue($result->successful);
        Http::assertSent(fn (Request $request): bool => $request['code'] === '432198'
            && $request['mobile'] === '09120000000');
    }

    public function test_call_otp_falls_back_to_alternate_network_on_technical_failure(): void
    {
        Http::fake([
            'p.api.ir/api/sw1/CallOTP' => Http::response([
                'success' => false,
                'code' => 503,
                'message' => 'شبکه اصلی قطع است',
                'data' => null,
            ]),
            'p.api.ir/api/sw1/CallOTPalt' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'ارسال شد',
                'data' => true,
            ]),
        ]);

        $delivery = $this->otpDelivery('auth.otp.call', NotificationChannel::Call, '654321');
        $result = app(ApiIrCallOtpProvider::class)->send($delivery);

        $this->assertTrue($result->successful);
        $this->assertSame('alternate', $result->payload['network']);
        Http::assertSentCount(2);
    }

    public function test_call_otp_falls_back_when_primary_network_rejects_the_send(): void
    {
        Http::fake([
            'p.api.ir/api/sw1/CallOTP' => Http::response([
                'success' => false,
                'code' => 0,
                'message' => 'ارسال در شبکه اصلی انجام نشد',
                'data' => false,
            ]),
            'p.api.ir/api/sw1/CallOTPalt' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'ارسال شد',
                'data' => true,
            ]),
        ]);

        $delivery = $this->otpDelivery('auth.otp.call', NotificationChannel::Call, '123456');
        $result = app(ApiIrCallOtpProvider::class)->send($delivery);

        $this->assertTrue($result->successful);
        $this->assertSame('alternate', $result->payload['network']);
        Http::assertSentCount(2);
    }

    private function otpDelivery(
        string $templateKey,
        NotificationChannel $channel,
        string $code,
    ): NotificationDelivery {
        $notification = Notification::query()->create([
            'template_key' => $templateKey,
            'event_key' => $templateKey,
            'channel' => NotificationChannel::Database,
            'recipient' => '09120000000',
            'payload' => ['code' => $code],
            'category' => NotificationCategory::Auth,
            'priority' => NotificationPriority::Critical,
            'is_critical' => true,
            'status' => NotificationStatus::Pending,
        ]);

        return $notification->deliveries()->create([
            'channel' => $channel,
            'recipient' => '09120000000',
            'payload' => ['code' => $code],
            'status' => 'pending',
        ])->load('notification');
    }
}
