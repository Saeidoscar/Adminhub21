<?php

namespace Tests\Feature;

use App\Enums\PurchaseIntentStatus;
use App\Models\ExternalServiceRequest;
use App\Models\Option;
use App\Models\PurchaseIntent;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserVerification;
use App\Models\Wallet;
use App\Models\WalletTransactionPayment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiIrVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Queue::fake();
        Option::set('api_ir_enabled', '1', 'external_services');
        Option::set('api_ir_base_url', 'https://p.api.ir', 'external_services');
        Option::set('api_ir_api_key', 'secret-api-key', 'external_services');
        Option::set('api_ir_identity_enabled', '1', 'external_services');
        Option::set('api_ir_bank_enabled', '1', 'external_services');
        Option::set('api_ir_level_one_lite_enabled', '1', 'external_services');
        Option::set('api_ir_level_one_lite_endpoint', '/api/sw1/ShahkarLite', 'external_services');
        Option::set('api_ir_level_one_pro_enabled', '1', 'external_services');
        Option::set('api_ir_level_one_pro_endpoint', '/api/sw1/ShahkarPro', 'external_services');
        Option::set('api_ir_level_two_endpoint', '/api/sw1/PersonInfo', 'external_services');
        Option::set('api_ir_iban_match_endpoint', '/api/sw1/IbanMatch', 'external_services');
        Option::set('api_ir_non_billable_http_statuses', '401,403,404,405,408,429,500,502,503,504', 'external_services');
        Option::set('api_ir_non_billable_codes', '401,403,408,429,500,502,503,504', 'external_services');
        Option::set('vat_percent', '0.1', 'pricing');
        Option::set('verify_level_one_cost', '10000', 'pricing');
        Option::set('verify_cost', '10000', 'pricing');
        Option::set('verify_iban_cost', '5000', 'pricing');
        Option::set('verify_level_three_deposit_amount', '10000', 'pricing');
        Option::set('payment_sep_enabled', '1', 'payment');
        Option::set('payment_sep_request_url', 'https://sep.test/token', 'payment');
        Option::set('payment_sep_verify_url', 'https://sep.test/verify', 'payment');
        Option::set('payment_sep_terminal_id', '12345678', 'payment');
        Option::set('payment_zibal_enabled', '1', 'payment');
        Option::set('payment_zibal_merchant', 'zibal-merchant', 'payment');
        Option::set('payment_zibal_request_url', 'https://zibal.test/request', 'payment');
        Option::set('payment_zibal_verify_url', 'https://zibal.test/verify', 'payment');
        Option::set('payment_zibal_start_url', 'https://zibal.test/start', 'payment');
    }

    public function test_negative_level_one_response_consumes_the_inquiry_cost(): void
    {
        $user = $this->userWithWallet();
        Sanctum::actingAs($user);

        Http::fake([
            'p.api.ir/api/sw1/ShahkarLite' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'کد ملی و موبایل مطابقت ندارند',
                'data' => false,
            ]),
        ]);

        $this->postJson('/v1/users/me/verification/level-one', [
            'national_id' => '1000000001',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('nationalId');

        $this->assertSame(40_000, $user->wallet()->firstOrFail()->balance);
        $this->assertSame(PurchaseIntentStatus::Completed, PurchaseIntent::sole()->status);
        $this->assertNull($user->verification()->first());

        $requestLog = ExternalServiceRequest::sole();
        $this->assertTrue($requestLog->billable);
        $this->assertSame(10_000, $requestLog->billed_amount);
        $this->assertNotNull($requestLog->billed_at);
        $this->assertNotNull($requestLog->wallet_transaction_id);
    }

    public function test_level_one_falls_back_to_pro_and_consumes_cost_once(): void
    {
        $user = $this->userWithWallet();
        Sanctum::actingAs($user);

        Http::fake([
            'p.api.ir/api/sw1/ShahkarLite' => Http::response([
                'success' => false,
                'code' => 503,
                'message' => 'شبکه Lite قطع است',
                'data' => null,
            ]),
            'p.api.ir/api/sw1/ShahkarPro' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'تطابق دارد',
                'data' => true,
            ]),
        ]);

        $this->postJson('/v1/users/me/verification/level-one', [
            'national_id' => '1000000001',
        ])->assertOk();

        $this->assertSame(40_000, $user->wallet()->firstOrFail()->balance);
        $this->assertSame(PurchaseIntentStatus::Completed, PurchaseIntent::sole()->status);
        $this->assertTrue($user->verification()->firstOrFail()->mobile_verified);

        $logs = ExternalServiceRequest::query()->orderBy('id')->get();
        $this->assertCount(2, $logs);
        $this->assertFalse($logs[0]->billable);
        $this->assertNull($logs[0]->billed_at);
        $this->assertTrue($logs[1]->billable);
        $this->assertSame(10_000, $logs[1]->billed_amount);
        $this->assertNotNull($logs[1]->billed_at);
    }

    public function test_technical_level_one_failure_does_not_consume_wallet_balance_when_both_networks_fail(): void
    {
        $user = $this->userWithWallet();
        Sanctum::actingAs($user);

        Http::fake([
            'p.api.ir/api/sw1/ShahkarLite' => Http::response([
                'success' => false,
                'code' => 503,
                'message' => 'شبکه Lite قطع است',
                'data' => null,
            ]),
            'p.api.ir/api/sw1/ShahkarPro' => Http::response([
                'success' => false,
                'code' => 503,
                'message' => 'شبکه Pro قطع است',
                'data' => null,
            ]),
        ]);

        $this->postJson('/v1/users/me/verification/level-one', [
            'national_id' => '1000000001',
        ])->assertStatus(503);

        $this->assertSame(50_000, $user->wallet()->firstOrFail()->balance);
        $this->assertSame(PurchaseIntentStatus::Failed, PurchaseIntent::sole()->status);
        $this->assertDatabaseCount('wallet_transactions', 0);

        $logs = ExternalServiceRequest::query()->orderBy('id')->get();
        $this->assertCount(2, $logs);
        $this->assertSame([
            'identity.level_one.shahkar_lite',
            'identity.level_one.shahkar_pro',
        ], $logs->pluck('service')->all());
        $this->assertTrue($logs->every(fn (ExternalServiceRequest $log): bool => ! $log->billable));
        $this->assertTrue($logs->every(fn (ExternalServiceRequest $log): bool => $log->billed_at === null));
        $this->assertTrue($logs->every(
            fn (ExternalServiceRequest $log): bool => $log->purchase_intent_id === PurchaseIntent::sole()->id,
        ));
    }

    public function test_level_two_replaces_names_with_normalized_official_values_and_locks_identity(): void
    {
        $user = $this->levelOneVerifiedUser();
        Sanctum::actingAs($user);

        Http::fake([
            'p.api.ir/api/sw1/PersonInfo' => Http::response([
                'Success' => true,
                'Code' => 0,
                'Message' => 'موفق',
                'Data' => [
                    'NationalCode' => '1000000001',
                    'FirstName' => 'فرهاد',
                    'LastName' => 'عبدي',
                    'FatherName' => 'علي',
                    'Gender' => 1,
                    'Alive' => true,
                ],
            ]),
        ]);

        $this->postJson('/v1/users/me/verification/level-two', [
            'birth_date' => '1370-01-01',
        ])->assertOk()
            ->assertJsonPath('data.verification.identityLocked', true);

        $user->refresh();
        $verification = $user->verification()->firstOrFail();

        $this->assertSame('فرهاد', $user->first_name);
        $this->assertSame('عبدی', $user->last_name);
        $this->assertSame('علی', $verification->national_data['father_name']);
        $this->assertNotNull($verification->identity_locked_at);
        $this->assertSame(40_000, $user->wallet()->firstOrFail()->balance);
        $this->assertSame(
            '[REDACTED]',
            ExternalServiceRequest::sole()->response_payload['data']['firstName'],
        );

        $this->patchJson('/v1/users/me', [
            'first_name' => 'فرهاد',
            'last_name' => 'عبدی',
            'email' => 'verified@example.test',
            'national_id' => '1000000001',
            'birth_date' => '1370-01-01',
            'city_id' => null,
        ])->assertOk();

        $this->assertSame('verified@example.test', $user->fresh()->email);

        $this->patchJson('/v1/users/me', [
            'first_name' => 'نام جدید',
            'last_name' => 'خانوادگی جدید',
            'email' => null,
            'national_id' => '1000000001',
            'birth_date' => '1370-01-01',
            'city_id' => null,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['firstName', 'lastName']);

        $this->assertSame('فرهاد', $user->fresh()->first_name);
        $this->assertSame('عبدی', $user->fresh()->last_name);
    }

    public function test_level_one_cannot_replace_the_national_code_after_level_two_lock(): void
    {
        $user = $this->levelTwoVerifiedUser();
        Sanctum::actingAs($user);
        Http::fake();

        $this->postJson('/v1/users/me/verification/level-one', [
            'national_id' => '1000000011',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('nationalId');

        Http::assertNothingSent();
        $this->assertSame('1000000001', $user->profile()->firstOrFail()->national_id);
        $this->assertDatabaseCount('purchase_intents', 0);
    }

    public function test_pascal_case_level_two_mismatch_is_billed_and_returns_validation_error(): void
    {
        $user = $this->levelOneVerifiedUser();
        Sanctum::actingAs($user);

        Http::fake([
            'p.api.ir/api/sw1/PersonInfo' => Http::response([
                'Data' => null,
                'Success' => true,
                'Code' => 0,
                'Message' => 'نتیجه استعلام : عدم تطابق اطلاعات',
            ]),
        ]);

        $this->postJson('/v1/users/me/verification/level-two', [
            'birth_date' => '1371-09-25',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('birthDate')
            ->assertJsonPath(
                'errors.birthDate.0',
                'کد ملی و تاریخ تولد واردشده با اطلاعات ثبت احوال مطابقت ندارد.',
            );

        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://p.api.ir/api/sw1/PersonInfo'
            && $request['nationalCode'] === '1000000001'
            && $request['birthDate'] === '1371/9/25'
        );

        $verification = $user->verification()->firstOrFail();
        $requestLog = ExternalServiceRequest::sole();

        $this->assertFalse($verification->national_verified);
        $this->assertNull($verification->identity_locked_at);
        $this->assertSame(40_000, $user->wallet()->firstOrFail()->balance);
        $this->assertSame('rejected', $requestLog->status);
        $this->assertTrue($requestLog->billable);
        $this->assertSame(10_000, $requestLog->billed_amount);
    }


    public function test_level_two_response_without_official_names_is_not_billed(): void
    {
        $user = $this->levelOneVerifiedUser();
        Sanctum::actingAs($user);

        Http::fake([
            'p.api.ir/api/sw1/PersonInfo' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'موفق',
                'data' => [
                    'nationalCode' => '1000000001',
                    'firstName' => 'فرهاد',
                    'lastName' => '',
                    'alive' => true,
                ],
            ]),
        ]);

        $this->postJson('/v1/users/me/verification/level-two', [
            'birth_date' => '1370-01-01',
        ])->assertStatus(503);

        $this->assertSame(50_000, $user->wallet()->firstOrFail()->balance);
        $this->assertSame(PurchaseIntentStatus::Failed, PurchaseIntent::sole()->status);
        $this->assertFalse(ExternalServiceRequest::sole()->billable);
        $this->assertNull($user->verification()->firstOrFail()->identity_locked_at);
    }

    public function test_iban_inquiry_is_rejected_before_payment_without_active_level_two(): void
    {
        $user = $this->levelOneVerifiedUser();
        Sanctum::actingAs($user);
        Http::fake();

        $this->patchJson('/v1/users/me/bank-account', [
            'iban' => 'IR820540102680020817909002',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('iban');

        Http::assertNothingSent();
        $this->assertDatabaseCount('purchase_intents', 0);
        $this->assertSame(50_000, $user->wallet()->firstOrFail()->balance);
    }

    public function test_successful_iban_match_stores_verified_iban_without_bank_verification(): void
    {
        $user = $this->levelTwoVerifiedUser();
        Sanctum::actingAs($user);

        Http::fake([
            'p.api.ir/api/sw1/IbanMatch' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'تطبیق موفق',
                'data' => true,
            ]),
        ]);

        $this->patchJson('/v1/users/me/bank-account', [
            'iban' => 'IR820540102680020817909002',
        ])->assertOk()
            ->assertJsonPath('data.ibanVerified', true);

        $verification = $user->verification()->firstOrFail();
        $this->assertSame(2, (int) $verification->verified_level);
        $this->assertFalse($verification->bank_verified);
        $this->assertNotNull($verification->iban_verified_at);
        $this->assertSame(
            'IR820540102680020817909002',
            $user->profile()->firstOrFail()->iban,
        );
        $this->assertSame(45_000, $user->wallet()->firstOrFail()->balance);
        $this->assertSame(5_000, ExternalServiceRequest::sole()->billed_amount);
    }

    public function test_negative_iban_match_is_billed_without_storing_the_iban(): void
    {
        $user = $this->levelTwoVerifiedUser();
        Sanctum::actingAs($user);

        Http::fake([
            'p.api.ir/api/sw1/IbanMatch' => Http::response([
                'success' => true,
                'code' => 0,
                'message' => 'عدم تطابق',
                'data' => false,
            ]),
        ]);

        $this->patchJson('/v1/users/me/bank-account', [
            'iban' => 'IR820540102680020817909002',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('iban');

        $this->assertNull($user->profile()->firstOrFail()->iban);
        $verification = $user->verification()->firstOrFail();
        $this->assertFalse($verification->bank_verified);
        $this->assertNull($verification->iban_verified_at);
        $this->assertSame(45_000, $user->wallet()->firstOrFail()->balance);
        $this->assertSame(5_000, ExternalServiceRequest::sole()->billed_amount);
    }

    public function test_gateway_paid_technical_inquiry_failure_keeps_credit_and_does_not_bill(): void
    {
        Option::set('verify_level_one_cost', '60000', 'pricing');
        $user = $this->userWithWallet();
        Sanctum::actingAs($user);

        Http::fake([
            'sep.test/token' => Http::response([
                'status' => 1,
                'token' => 'sep-token-technical',
            ]),
            'sep.test/verify' => Http::response([
                'ResultCode' => 0,
                'SecurePan' => '603799******1234',
                'RRN' => '11223344',
            ]),
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

        $this->postJson('/v1/users/me/verification/level-one', [
            'national_id' => '1000000001',
            'gateway' => 'sep',
        ])->assertOk()
            ->assertJsonPath('data.payment.requiresGateway', true);

        $payment = WalletTransactionPayment::query()->sole();

        $this->postJson("/v1/payments/{$payment->id}/callback", [
            'RefNum' => 'sep-ref-technical',
        ])->assertStatus(503);

        $wallet = $user->wallet()->firstOrFail();
        $intent = PurchaseIntent::sole();
        $requestLogs = ExternalServiceRequest::query()->orderBy('id')->get();

        $this->assertSame(PurchaseIntentStatus::Paid, $intent->status);
        $this->assertSame(110_000, $wallet->balance);
        $this->assertSame(110_000, $wallet->blocked_balance);
        $this->assertSame(0, $wallet->withdrawable_balance);
        $this->assertCount(2, $requestLogs);
        $this->assertSame([
            'identity.level_one.shahkar_lite',
            'identity.level_one.shahkar_pro',
        ], $requestLogs->pluck('service')->all());
        $this->assertTrue($requestLogs->every(fn (ExternalServiceRequest $log): bool => ! $log->billable));
        $this->assertTrue($requestLogs->every(fn (ExternalServiceRequest $log): bool => $log->billed_at === null));
        $this->assertNull($intent->purchase_transaction_id);
    }

    public function test_legacy_bank_verified_flag_does_not_bypass_level_three_payment(): void
    {
        $user = $this->levelTwoVerifiedUser();
        $user->verification->forceFill([
            'bank_verified' => true,
            'bank_verified_at' => now(),
            'bank_data' => null,
        ])->save();
        Sanctum::actingAs($user->fresh(['profile', 'verification', 'wallet']));

        Http::fake([
            'sep.test/token' => Http::response([
                'status' => 1,
                'token' => 'sep-token-legacy',
            ]),
        ]);

        $this->postJson('/v1/users/me/verification/level-three', [
            'gateway' => 'sep',
        ])->assertOk()
            ->assertJsonPath('data.payment.requiresGateway', true);

        $this->assertDatabaseCount('wallet_transaction_payments', 1);
    }

    public function test_level_three_sends_national_code_to_gateway_and_credits_wallet_after_success(): void
    {
        $user = $this->levelTwoVerifiedUser();
        Sanctum::actingAs($user);

        Http::fake([
            'sep.test/token' => Http::response([
                'status' => 1,
                'token' => 'sep-token-123',
            ]),
            'sep.test/verify' => Http::response([
                'Success' => true,
                'ResultCode' => 0,
                'ResultDescription' => 'تراکنش موفق است',
                'TransactionDetail' => [
                    'RefNum' => 'sep-ref-123',
                    'TerminalNumber' => '12345678',
                    'OrginalAmount' => 100_000,
                    'MaskedPan' => '603799******1234',
                    'RRN' => '99887766',
                ],
            ]),
        ]);

        $response = $this->postJson('/v1/users/me/verification/level-three', [
            'gateway' => 'sep',
            'return_url' => 'https://dadline.test/pishkhan/profile/verification',
        ])->assertOk()
            ->assertJsonPath('data.payment.requiresGateway', true)
            ->assertJsonPath('data.payment.paymentUrl', 'https://sep.test/token');

        $payment = WalletTransactionPayment::query()->sole();

        Http::assertSent(function (\Illuminate\Http\Client\Request $request): bool {
            if ($request->url() !== 'https://sep.test/token') {
                return false;
            }

            $payload = $request->data();

            return ($payload['NationalCode'] ?? null) === '1000000001'
                && ($payload['CellNumber'] ?? null) === '09120000000'
                && ($payload['Amount'] ?? null) === 100_000;
        });

        $this->postJson("/v1/payments/{$payment->id}/callback", [
            'RefNum' => 'sep-ref-123',
        ])->assertOk()
            ->assertJsonPath('data.fulfillment.status', 'verified');

        Http::assertSent(function (\Illuminate\Http\Client\Request $request): bool {
            if ($request->url() !== 'https://sep.test/verify') {
                return false;
            }

            return $request->data() === [
                'TerminalNumber' => '12345678',
                'RefNum' => 'sep-ref-123',
                'CellNumber' => '09120000000',
                'NationalCode' => '1000000001',
                'IgnoreNationalcode' => false,
            ];
        });

        $verification = $user->verification()->firstOrFail();
        $wallet = $user->wallet()->firstOrFail();

        $this->assertTrue($verification->bank_verified);
        $this->assertSame(3, (int) $verification->verified_level);
        $this->assertNotNull($verification->bank_verified_at);
        $this->assertSame($payment->id, $verification->bank_data['payment_id']);
        $this->assertSame('gateway_national_code', $verification->bank_data['ownership_check']);
        $this->assertSame('sep_verify_national_code', $verification->bank_data['ownership_method']);
        $this->assertSame(10_000, $payment->request_payload['expected_amount']);
        $this->assertSame(100_000, $payment->request_payload['expected_amount_rial']);
        $this->assertSame('1000000001', $payment->request_payload['national_code']);
        $this->assertSame('09120000000', $payment->request_payload['mobile']);
        $this->assertSame('12345678', $payment->terminal_id);
        $this->assertSame(60_000, $wallet->balance);
        $this->assertSame(50_000, $wallet->blocked_balance);
        $this->assertSame(10_000, $wallet->withdrawable_balance);

        $this->postJson("/v1/payments/{$payment->id}/callback", [
            'RefNum' => 'sep-ref-123',
        ])->assertOk();

        $wallet->refresh();
        $this->assertSame(60_000, $wallet->balance);
        $this->assertSame(10_000, $wallet->withdrawable_balance);
    }

    public function test_level_three_smart_fallback_to_zibal_keeps_card_owner_enforcement(): void
    {
        $user = $this->levelTwoVerifiedUser();
        Sanctum::actingAs($user);

        Http::fake([
            'sep.test/token' => Http::response([
                'status' => -1,
                'errorCode' => 500,
                'errorDesc' => 'SEP unavailable',
            ]),
            'zibal.test/request' => Http::response([
                'result' => 100,
                'message' => 'success',
                'trackId' => 15966442233311,
            ]),
        ]);

        $this->postJson('/v1/users/me/verification/level-three', [
            'gateway' => 'smart',
        ])->assertOk()
            ->assertJsonPath('data.payment.gateway', 'zibal');

        $payment = WalletTransactionPayment::query()->sole();

        $this->assertTrue($payment->request_payload['gateway_card_owner_verification_enforced']);
        $this->assertSame(
            'zibal_request_national_code',
            $payment->request_payload['gateway_card_owner_verification_method'],
        );

        Http::assertSent(function (\Illuminate\Http\Client\Request $request): bool {
            if ($request->url() !== 'https://zibal.test/request') {
                return false;
            }

            return ($request->data()['nationalCode'] ?? null) === '1000000001';
        });
    }

    public function test_level_three_zibal_enforces_national_code_and_credits_wallet_after_success(): void
    {
        $user = $this->levelTwoVerifiedUser();
        Sanctum::actingAs($user);

        Http::fake([
            'zibal.test/request' => Http::response([
                'result' => 100,
                'message' => 'success',
                'trackId' => 15966442233311,
            ]),
            'zibal.test/verify' => Http::response([
                'result' => 100,
                'message' => 'success',
                'amount' => 100_000,
                'refNumber' => 'zibal-ref-123',
                'cardNumber' => '603799******1234',
            ]),
        ]);

        $this->postJson('/v1/users/me/verification/level-three', [
            'gateway' => 'zibal',
        ])->assertOk()
            ->assertJsonPath('data.payment.gateway', 'zibal');

        $payment = WalletTransactionPayment::query()->sole();

        Http::assertSent(function (\Illuminate\Http\Client\Request $request): bool {
            if ($request->url() !== 'https://zibal.test/request') {
                return false;
            }

            $payload = $request->data();

            return ($payload['nationalCode'] ?? null) === '1000000001'
                && ($payload['mobile'] ?? null) === '09120000000'
                && ($payload['amount'] ?? null) === 100_000;
        });

        $this->postJson("/v1/payments/{$payment->id}/callback", [
            'trackId' => '15966442233311',
        ])->assertOk()
            ->assertJsonPath('data.fulfillment.status', 'verified');

        $verification = $user->verification()->firstOrFail();
        $wallet = $user->wallet()->firstOrFail();

        $this->assertTrue($verification->bank_verified);
        $this->assertSame('zibal_request_national_code', $verification->bank_data['ownership_method']);
        $this->assertSame(60_000, $wallet->balance);
        $this->assertSame(10_000, $wallet->withdrawable_balance);
    }

    public function test_level_three_technical_verify_failure_is_kept_for_retry_without_credit(): void
    {
        $user = $this->levelTwoVerifiedUser();
        Sanctum::actingAs($user);

        Http::fake([
            'sep.test/token' => Http::response([
                'status' => 1,
                'token' => 'sep-token-retry',
            ]),
            'sep.test/verify' => Http::response([
                'message' => 'temporary outage',
            ], 503),
        ]);

        $this->postJson('/v1/users/me/verification/level-three', [
            'gateway' => 'sep',
        ])->assertOk();

        $payment = WalletTransactionPayment::query()->sole();

        $this->postJson("/v1/payments/{$payment->id}/callback", [
            'RefNum' => 'sep-ref-retry',
        ])->assertStatus(503);

        $payment->refresh();
        $wallet = $user->wallet()->firstOrFail();

        $this->assertSame('processing', $payment->status->value);
        $this->assertSame('processing', $payment->transaction()->firstOrFail()->status->value);
        $this->assertSame(503, $payment->response_payload['http_status']);
        $this->assertTrue($payment->response_payload['retryable']);
        $this->assertFalse($user->verification()->firstOrFail()->bank_verified);
        $this->assertSame(50_000, $wallet->balance);
        $this->assertSame(0, $wallet->withdrawable_balance);
    }

    public function test_level_three_failed_card_ownership_does_not_verify_or_credit_wallet(): void
    {
        $user = $this->levelTwoVerifiedUser();
        Sanctum::actingAs($user);

        Http::fake([
            'sep.test/token' => Http::response([
                'status' => 1,
                'token' => 'sep-token-failed',
            ]),
            'sep.test/verify' => Http::response([
                'ResultCode' => -2,
                'ResultDescription' => 'کارت متعلق به کد ملی نیست',
            ]),
        ]);

        $this->postJson('/v1/users/me/verification/level-three', [
            'gateway' => 'sep',
        ])->assertOk();

        $payment = WalletTransactionPayment::query()->sole();

        $this->postJson("/v1/payments/{$payment->id}/callback", [
            'RefNum' => 'sep-ref-failed',
        ])->assertUnprocessable();

        $verification = $user->verification()->firstOrFail();
        $wallet = $user->wallet()->firstOrFail();

        $this->assertFalse($verification->bank_verified);
        $this->assertSame(2, (int) $verification->verified_level);
        $this->assertSame(50_000, $wallet->balance);
        $this->assertSame(50_000, $wallet->blocked_balance);
        $this->assertSame(0, $wallet->withdrawable_balance);
        $payment->refresh();
        $this->assertSame('failed', $payment->status->value);
        $this->assertSame(-2, $payment->response_payload['ResultCode']);
        $this->assertSame(
            'کارت متعلق به کد ملی نیست',
            $payment->response_payload['ResultDescription'],
        );
        $this->assertContains(
            'gateway_rejected',
            $payment->response_payload['_dadline_verification']['validation_errors'],
        );
    }

    private function userWithWallet(): User
    {
        $user = User::query()->create([
            'mobile' => '09120000000',
            'first_name' => 'نام اولیه',
            'last_name' => 'نام خانوادگی اولیه',
            'role' => 'user',
        ]);

        Wallet::query()->create([
            'user_id' => $user->id,
            'balance' => 50_000,
            'blocked_balance' => 50_000,
            'withdrawable_balance' => 0,
            'status' => 'active',
        ]);

        return $user;
    }

    private function levelOneVerifiedUser(): User
    {
        $user = $this->userWithWallet();

        UserProfile::query()->create([
            'user_id' => $user->id,
            'national_id' => '1000000001',
        ]);

        UserVerification::query()->create([
            'user_id' => $user->id,
            'verified_level' => 1,
            'mobile_verified' => true,
            'mobile_verified_at' => now(),
            'national_verified' => false,
            'bank_verified' => false,
        ]);

        return $user->fresh(['profile', 'verification', 'wallet']);
    }

    private function levelTwoVerifiedUser(): User
    {
        $user = $this->levelOneVerifiedUser();
        $user->profile->forceFill(['birth_date' => '1370-01-01'])->save();
        $user->verification->forceFill([
            'verified_level' => 2,
            'national_verified' => true,
            'national_verified_at' => now(),
            'identity_locked_at' => now(),
        ])->save();

        return $user->fresh(['profile', 'verification', 'wallet']);
    }
}
