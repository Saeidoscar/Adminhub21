<?php

namespace Tests\Feature;

use App\Enums\PayoutSettlementStatus;
use App\Enums\UserSubscriptionPlan;
use App\Enums\WalletTransactionStatus;
use App\Jobs\Settlements\SubmitPayoutSettlementJob;
use App\Models\Option;
use App\Models\PayoutSettlement;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserSubscription;
use App\Models\UserVerification;
use App\Models\Wallet;
use App\Services\ExternalServices\Zibal\ZibalEbankException;
use App\Services\Settlements\PayoutSettlementService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PayoutSettlementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(Carbon::parse('2026-08-02 17:00:00', 'Asia/Tehran'));
        Queue::fake();
        Option::set('settlement_fee', '5500', 'pricing');
        Option::set('zibal_ebank_enabled', '1', 'external_services');
        Option::set('zibal_ebank_base_url', 'https://api.zibal.test', 'external_services');
        Option::set('zibal_ebank_access_token', 'secret-token', 'external_services');
        Option::set('zibal_ebank_account_id', 'account-123', 'external_services');
        Option::set('zibal_ebank_reason_code', '4', 'external_services');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_withdrawal_is_rejected_before_balance_changes_when_zibal_is_not_configured(): void
    {
        Option::set('zibal_ebank_enabled', '0', 'external_services');
        $user = $this->verifiedUser(withSubscription: true);
        Sanctum::actingAs($user);

        $this->postJson('/v1/users/me/wallet/withdrawals', [
            'amount' => 100_000,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('amount');

        $wallet = $user->wallet()->firstOrFail();
        $this->assertSame(200_000, $wallet->balance);
        $this->assertSame(200_000, $wallet->withdrawable_balance);
        $this->assertDatabaseCount('payout_settlements', 0);
    }

    public function test_withdrawal_requires_a_nationally_matched_iban(): void
    {
        $user = $this->verifiedUser(withSubscription: true);
        $user->verification->forceFill(['iban_verified_at' => null])->save();
        Sanctum::actingAs($user->fresh(['profile', 'verification', 'wallet', 'subscription']));

        $this->postJson('/v1/users/me/wallet/withdrawals', [
            'amount' => 100_000,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('amount');

        $wallet = $user->wallet()->firstOrFail();
        $this->assertSame(200_000, $wallet->balance);
        $this->assertDatabaseCount('payout_settlements', 0);
    }

    public function test_withdrawal_requires_level_three_bank_identity_verification(): void
    {
        $user = $this->verifiedUser(withSubscription: true);
        $user->verification->forceFill([
            'verified_level' => 2,
            'bank_verified' => false,
            'bank_verified_at' => null,
        ])->save();
        Sanctum::actingAs($user->fresh(['profile', 'verification', 'wallet', 'subscription']));

        $this->postJson('/v1/users/me/wallet/withdrawals', [
            'amount' => 100_000,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('amount');

        $wallet = $user->wallet()->firstOrFail();
        $this->assertSame(200_000, $wallet->balance);
        $this->assertDatabaseCount('payout_settlements', 0);
    }

    public function test_withdrawal_requires_gateway_national_code_ownership_evidence(): void
    {
        $user = $this->verifiedUser(withSubscription: true);
        $user->verification->forceFill(['bank_data' => null])->save();
        Sanctum::actingAs($user->fresh(['profile', 'verification', 'wallet', 'subscription']));

        $this->postJson('/v1/users/me/wallet/withdrawals', [
            'amount' => 100_000,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('amount');

        $this->assertDatabaseCount('payout_settlements', 0);
        $this->assertSame(200_000, $user->wallet()->firstOrFail()->balance);
    }

    public function test_active_subscriber_withdrawal_is_queued_for_immediate_payment(): void
    {
        $user = $this->verifiedUser(withSubscription: true);
        Sanctum::actingAs($user);

        $this->postJson('/v1/users/me/wallet/withdrawals', [
            'amount' => 100_000,
        ])->assertCreated()
            ->assertJsonPath('data.status', PayoutSettlementStatus::Processing->value)
            ->assertJsonPath('data.totalPayable', 94_500);

        $settlement = PayoutSettlement::sole();

        $this->assertSame(100_000, $user->wallet()->firstOrFail()->balance);
        $this->assertSame(100_000, $user->wallet()->firstOrFail()->withdrawable_balance);
        $this->assertSame('instant', $settlement->transaction->payload['settlement_mode']);
        $this->assertNotEmpty($settlement->unique_code);

        Queue::assertPushed(
            SubmitPayoutSettlementJob::class,
            fn (SubmitPayoutSettlementJob $job): bool => $job->settlementId === $settlement->id,
        );
    }

    public function test_non_subscriber_withdrawal_stays_pending_until_month_end(): void
    {
        $user = $this->verifiedUser();
        Sanctum::actingAs($user);

        $this->postJson('/v1/users/me/wallet/withdrawals', [
            'amount' => 100_000,
        ])->assertCreated()
            ->assertJsonPath('data.status', PayoutSettlementStatus::Pending->value);

        $settlement = PayoutSettlement::sole();

        $this->assertSame('monthly', $settlement->transaction->payload['settlement_mode']);
        $this->assertNotNull($settlement->scheduled_for);
        Queue::assertNotPushed(SubmitPayoutSettlementJob::class);
    }

    public function test_monthly_command_does_not_claim_a_settlement_before_its_deadline(): void
    {
        $user = $this->verifiedUser();
        $settlement = app(PayoutSettlementService::class)->request($user, 100_000, 5_500);

        $this->artisan('settlements:dispatch-monthly')
            ->assertSuccessful();

        $this->assertSame(PayoutSettlementStatus::Pending, $settlement->refresh()->status);
        Queue::assertNotPushed(SubmitPayoutSettlementJob::class);
    }

    public function test_month_end_command_claims_pending_settlements_once(): void
    {
        $user = $this->verifiedUser();
        $settlement = app(PayoutSettlementService::class)->request($user, 100_000, 5_500);

        $this->artisan('settlements:dispatch-monthly --force')
            ->assertSuccessful();

        $this->assertSame(PayoutSettlementStatus::Processing, $settlement->refresh()->status);
        $this->assertSame(WalletTransactionStatus::Processing, $settlement->transaction->refresh()->status);
        Queue::assertPushed(SubmitPayoutSettlementJob::class, 1);

        $this->artisan('settlements:dispatch-monthly --force')
            ->assertSuccessful();

        Queue::assertPushed(SubmitPayoutSettlementJob::class, 1);
    }

    public function test_successful_zibal_transfer_completes_the_settlement(): void
    {
        $user = $this->verifiedUser(withSubscription: true);
        $settlement = app(PayoutSettlementService::class)->request($user, 100_000, 5_500);

        Http::fake([
            'api.zibal.test/ebank/v1/account/checkout/create/' => Http::response([
                'result' => 1,
                'data' => [
                    'trackerId' => '19',
                    'receipt' => 'https://r.zib.al/ec/TiRCNJ',
                    'uniqueCode' => $settlement->unique_code,
                    'checkouts' => [
                        ['status' => 3],
                    ],
                ],
            ]),
        ]);

        app(PayoutSettlementService::class)->submit($settlement->id);

        $settlement->refresh();
        $this->assertSame(PayoutSettlementStatus::Completed, $settlement->status);
        $this->assertSame('19', $settlement->track_id);
        $this->assertNotNull($settlement->paid_at);
        $this->assertSame(WalletTransactionStatus::Completed, $settlement->transaction->refresh()->status);
        $this->assertSame(100_000, $user->wallet()->firstOrFail()->balance);
    }

    public function test_non_retryable_zibal_failure_refunds_the_wallet_once(): void
    {
        $user = $this->verifiedUser(withSubscription: true);
        $settlement = app(PayoutSettlementService::class)->request($user, 100_000, 5_500);

        Http::fake([
            'api.zibal.test/ebank/v1/account/checkout/create/' => Http::response([
                'result' => 21,
                'message' => 'شماره شبا نامعتبر است.',
            ], 400),
        ]);

        $service = app(PayoutSettlementService::class);
        $service->submit($settlement->id);
        $service->submit($settlement->id);

        $settlement->refresh();
        $wallet = $user->wallet()->firstOrFail();

        $this->assertSame(PayoutSettlementStatus::Failed, $settlement->status);
        $this->assertSame(200_000, $wallet->balance);
        $this->assertSame(200_000, $wallet->withdrawable_balance);
        $this->assertSame(WalletTransactionStatus::Failed, $settlement->transaction->refresh()->status);
    }

    public function test_transient_failure_does_not_refund_an_ambiguous_transfer(): void
    {
        $user = $this->verifiedUser(withSubscription: true);
        $settlement = app(PayoutSettlementService::class)->request($user, 100_000, 5_500);

        Http::fake([
            'api.zibal.test/*' => Http::response([
                'result' => 45,
                'message' => 'سرویس‌دهنده در دسترس نیست.',
            ], 500),
        ]);

        try {
            app(PayoutSettlementService::class)->submit($settlement->id);
            $this->fail('Expected a retryable Zibal exception.');
        } catch (ZibalEbankException $exception) {
            $this->assertTrue($exception->retryable);
        }

        $settlement->refresh();
        $wallet = $user->wallet()->firstOrFail();

        $this->assertSame(PayoutSettlementStatus::Processing, $settlement->status);
        $this->assertSame(100_000, $wallet->balance);
        $this->assertSame(100_000, $wallet->withdrawable_balance);
        $this->assertNotNull($settlement->failure_reason);
    }


    public function test_unknown_inquiry_error_keeps_the_settlement_processing(): void
    {
        $user = $this->verifiedUser(withSubscription: true);
        $settlement = app(PayoutSettlementService::class)->request($user, 100_000, 5_500);
        $settlement->forceFill(['track_id' => '19'])->save();

        Http::fake([
            'api.zibal.test/ebank/v1/account/checkout/inquire/*' => Http::response([
                'result' => 6,
                'message' => 'مقدار ورودی نامعتبر است.',
            ], 400),
        ]);

        app(PayoutSettlementService::class)->inquire($settlement->id);

        $settlement->refresh();
        $wallet = $user->wallet()->firstOrFail();

        $this->assertSame(PayoutSettlementStatus::Processing, $settlement->status);
        $this->assertSame(100_000, $wallet->balance);
        $this->assertSame(100_000, $wallet->withdrawable_balance);
        $this->assertSame('مقدار ورودی نامعتبر است.', $settlement->failure_reason);
    }

    public function test_reversed_webhook_refunds_the_wallet_only_once(): void
    {
        Option::set('zibal_ebank_webhook_token', 'webhook-secret', 'external_services');
        $user = $this->verifiedUser(withSubscription: true);
        $settlement = app(PayoutSettlementService::class)->request($user, 100_000, 5_500);
        $payload = [
            'data' => [
                'unique_code' => $settlement->unique_code,
                'tracker_id' => '155',
                'checkouts' => [
                    ['status' => 4],
                ],
            ],
        ];

        $this->postJson('/v1/webhooks/zibal/ebank/webhook-secret', $payload)
            ->assertOk()
            ->assertJsonPath('handled', true);

        $this->postJson('/v1/webhooks/zibal/ebank/webhook-secret', $payload)
            ->assertOk()
            ->assertJsonPath('handled', true);

        $settlement->refresh();
        $wallet = $user->wallet()->firstOrFail();

        $this->assertSame(PayoutSettlementStatus::Reversed, $settlement->status);
        $this->assertSame(200_000, $wallet->balance);
        $this->assertSame(200_000, $wallet->withdrawable_balance);
        $this->assertSame(WalletTransactionStatus::Reversed, $settlement->transaction->refresh()->status);
    }

    public function test_webhook_rejects_an_invalid_token(): void
    {
        Option::set('zibal_ebank_webhook_token', 'webhook-secret', 'external_services');

        $this->postJson('/v1/webhooks/zibal/ebank/wrong-token', [
            'data' => ['unique_code' => 'unknown'],
        ])->assertNotFound();
    }

    private function verifiedUser(bool $withSubscription = false): User
    {
        $user = User::query()->create([
            'first_name' => 'فرهاد',
            'last_name' => 'عبدی',
            'mobile' => '09123456789',
            'role' => 'user',
        ]);

        UserProfile::query()->create([
            'user_id' => $user->id,
            'national_id' => '0012345678',
            'iban' => 'IR030170000565276560000001',
        ]);

        UserVerification::query()->create([
            'user_id' => $user->id,
            'verified_level' => 3,
            'mobile_verified' => true,
            'mobile_verified_at' => now(),
            'national_verified' => true,
            'national_verified_at' => now(),
            'identity_locked_at' => now(),
            'iban_verified_at' => now(),
            'bank_verified' => true,
            'bank_verified_at' => now(),
            'bank_data' => [
                'ownership_check' => 'gateway_national_code',
            ],
        ]);

        Wallet::query()->create([
            'user_id' => $user->id,
            'balance' => 200_000,
            'withdrawable_balance' => 200_000,
        ]);

        if ($withSubscription) {
            UserSubscription::query()->create([
                'user_id' => $user->id,
                'plan' => UserSubscriptionPlan::Premium,
                'expires_at' => now()->addMonth(),
            ]);
        }

        return $user->refresh();
    }
}
