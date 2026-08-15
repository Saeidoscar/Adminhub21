<?php

namespace App\Services\Settlements;

use App\Enums\PayoutSettlementStatus;
use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Jobs\Settlements\SubmitPayoutSettlementJob;
use App\Models\PayoutSettlement;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\ExternalServices\Zibal\ZibalEbankException;
use App\Services\ExternalServices\Zibal\ZibalEbankPayoutProvider;
use App\Services\Settlements\Data\BankTransferResult;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PayoutSettlementService
{
    public function __construct(
        private readonly ZibalEbankPayoutProvider $provider,
        private readonly PersianCalendar $calendar,
    ) {}

    public function request(User $user, int $amount, int $fee): PayoutSettlement
    {
        $user->loadMissing(['profile', 'verification', 'subscription']);
        $this->validateWithdrawal($user, $amount);

        try {
            $this->provider->ensureConfigured();
        } catch (ZibalEbankException) {
            throw ValidationException::withMessages([
                'amount' => 'سرویس تسویه بانکی موقتاً در دسترس نیست. لطفاً با پشتیبانی تماس بگیرید.',
            ]);
        }

        $settlement = DB::transaction(function () use ($amount, $fee, $user): PayoutSettlement {
            $wallet = Wallet::query()
                ->whereKey($user->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($wallet->withdrawable_balance < $amount) {
                throw ValidationException::withMessages([
                    'amount' => 'موجودی قابل برداشت کافی نیست.',
                ]);
            }

            $hasActiveSubscription = $user->subscription?->active() === true;
            $status = $hasActiveSubscription
                ? PayoutSettlementStatus::Processing
                : PayoutSettlementStatus::Pending;

            $wallet->forceFill([
                'balance' => $wallet->balance - $amount,
                'withdrawable_balance' => $wallet->withdrawable_balance - $amount,
            ])->save();

            $transaction = WalletTransaction::query()->create([
                'user_id' => $user->id,
                'amount' => $amount,
                'direction' => WalletTransactionDirection::Withdrawal,
                'type' => WalletTransactionType::DepositIncome,
                'status' => $status === PayoutSettlementStatus::Processing
                    ? WalletTransactionStatus::Processing
                    : WalletTransactionStatus::Pending,
                'payload' => [
                    'settlement_mode' => $hasActiveSubscription ? 'instant' : 'monthly',
                ],
            ]);

            return PayoutSettlement::query()->create([
                'transaction_id' => $transaction->id,
                'amount' => $amount,
                'fee' => min($fee, $amount),
                'total_payable' => $amount - min($fee, $amount),
                'iban' => strtoupper((string) $user->profile?->iban),
                'provider' => ZibalEbankPayoutProvider::NAME,
                'unique_code' => (string) Str::uuid(),
                'scheduled_for' => $hasActiveSubscription
                    ? null
                    : $this->calendar->payoutAt(now('Asia/Tehran')),
                'status' => $status,
            ]);
        });

        if ($settlement->status === PayoutSettlementStatus::Processing) {
            SubmitPayoutSettlementJob::dispatch($settlement->id)->afterCommit();
        }

        return $settlement;
    }

    public function dispatchMonthly(int $limit = 500, bool $force = false): int
    {
        $dispatched = 0;

        PayoutSettlement::query()
            ->where('status', PayoutSettlementStatus::Pending->value)
            ->when(
                ! $force,
                fn ($query) => $query
                    ->whereNotNull('scheduled_for')
                    ->where('scheduled_for', '<=', now()),
            )
            ->orderBy('id')
            ->limit(max(1, $limit))
            ->pluck('id')
            ->each(function (int $settlementId) use (&$dispatched): void {
                $claimed = DB::transaction(function () use ($settlementId): bool {
                    $settlement = PayoutSettlement::query()
                        ->whereKey($settlementId)
                        ->lockForUpdate()
                        ->first();

                    if ($settlement === null || $settlement->status !== PayoutSettlementStatus::Pending) {
                        return false;
                    }

                    $settlement->forceFill([
                        'status' => PayoutSettlementStatus::Processing,
                        'failure_reason' => null,
                    ])->save();

                    $settlement->transaction()->update([
                        'status' => WalletTransactionStatus::Processing->value,
                    ]);

                    return true;
                });

                if ($claimed) {
                    SubmitPayoutSettlementJob::dispatch($settlementId)->afterCommit();
                    $dispatched++;
                }
            });

        return $dispatched;
    }

    public function submit(int $settlementId): void
    {
        $settlement = PayoutSettlement::query()->findOrFail($settlementId);

        if (! in_array($settlement->status, [
            PayoutSettlementStatus::Pending,
            PayoutSettlementStatus::Processing,
        ], true)) {
            return;
        }

        try {
            $result = $this->provider->submit($settlement);
            $this->applyResult($settlement->id, $result, true);
        } catch (ZibalEbankException $exception) {
            if ($exception->retryable) {
                $this->recordTechnicalFailure($settlement->id, $exception->getMessage(), $exception->payload);
                throw $exception;
            }

            $this->failAndRefund(
                $settlement->id,
                $exception->getMessage(),
                PayoutSettlementStatus::Failed,
                $exception->payload,
            );
        }
    }

    public function inquire(int $settlementId): void
    {
        $settlement = PayoutSettlement::query()->findOrFail($settlementId);

        if ($settlement->status !== PayoutSettlementStatus::Processing) {
            return;
        }

        try {
            $result = $this->provider->inquire($settlement);
            $this->applyResult($settlement->id, $result, false);
        } catch (ZibalEbankException $exception) {
            $this->recordTechnicalFailure($settlement->id, $exception->getMessage(), $exception->payload);

            if ($this->isDefinitiveProviderFailure($exception)) {
                $this->failAndRefund(
                    $settlement->id,
                    $exception->getMessage(),
                    PayoutSettlementStatus::Failed,
                    $exception->payload,
                );
            }
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function handleWebhook(array $payload): bool
    {
        $uniqueCode = $this->provider->uniqueCodeFromPayload($payload);
        $trackerId = $this->provider->trackerIdFromPayload($payload);

        if ($uniqueCode === null && $trackerId === null) {
            return false;
        }

        $settlement = PayoutSettlement::query()
            ->when(
                $uniqueCode !== null,
                fn ($query) => $query->where('unique_code', $uniqueCode),
                fn ($query) => $query->where('track_id', $trackerId),
            )
            ->first();

        if ($settlement === null) {
            return false;
        }

        $this->applyResult($settlement->id, $this->provider->fromWebhook($payload), false);

        return true;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function recordTechnicalFailure(int $settlementId, string $message, array $payload = []): void
    {
        $updates = [
            'failure_reason' => $message,
            'last_checked_at' => now(),
            'updated_at' => now(),
        ];

        if ($payload !== []) {
            $updates['provider_data'] = $payload;
        }

        PayoutSettlement::query()
            ->whereKey($settlementId)
            ->where('status', PayoutSettlementStatus::Processing->value)
            ->update($updates);
    }


    private function isDefinitiveProviderFailure(ZibalEbankException $exception): bool
    {
        return ! $exception->retryable
            && in_array($exception->resultCode, [2, 3, 4, 7, 8, 9, 21, 29], true);
    }

    private function validateWithdrawal(User $user, int $amount): void
    {
        if ($amount < 10_000) {
            throw ValidationException::withMessages([
                'amount' => 'حداقل مبلغ برداشت ۱۰٬۰۰۰ تومان است.',
            ]);
        }

        if ((int) ($user->verification?->verified_level ?? 0) < 2 || ! $user->verification?->isVerified()) {
            throw ValidationException::withMessages([
                'amount' => 'برای برداشت درآمد، احراز هویت سطح ۲ الزامی است.',
            ]);
        }

        if (blank($user->profile?->iban)) {
            throw ValidationException::withMessages([
                'amount' => 'برای برداشت درآمد، ابتدا شماره شبا را در پروفایل ثبت کنید.',
            ]);
        }

        if ($user->verification?->iban_verified_at === null) {
            throw ValidationException::withMessages([
                'amount' => 'برای برداشت درآمد، شماره شبا باید با کد ملی شما تطبیق داده شود.',
            ]);
        }

        // if (
        //     ! (bool) ($user->verification?->bank_verified ?? false)
        //     || (int) ($user->verification?->verified_level ?? 0) < 3
        //     || $user->verification?->bank_verified_at === null
        //     || ($user->verification?->bank_data['ownership_check'] ?? null) !== 'gateway_national_code'
        // ) {
        //     throw ValidationException::withMessages([
        //         'amount' => 'برای برداشت درآمد، احراز هویت بانکی سطح ۳ الزامی است.',
        //     ]);
        // }
    }

    private function applyResult(int $settlementId, BankTransferResult $result, bool $submitted): void
    {
        match ($result->status) {
            3 => $this->complete($settlementId, $result, $submitted),
            4 => $this->failAndRefund(
                $settlementId,
                'مبلغ انتقال وجه توسط بانک به حساب مبدا برگشت داده شد.',
                PayoutSettlementStatus::Reversed,
                $result->payload,
                $result,
            ),
            5 => $this->failAndRefund(
                $settlementId,
                'انتقال وجه توسط بانک ناموفق اعلام شد.',
                PayoutSettlementStatus::Failed,
                $result->payload,
                $result,
            ),
            default => $this->markProcessing($settlementId, $result, $submitted),
        };
    }

    private function complete(int $settlementId, BankTransferResult $result, bool $submitted): void
    {
        DB::transaction(function () use ($result, $settlementId, $submitted): void {
            $settlement = PayoutSettlement::query()->whereKey($settlementId)->lockForUpdate()->firstOrFail();

            if ($settlement->status === PayoutSettlementStatus::Completed) {
                return;
            }

            if (in_array($settlement->status, [PayoutSettlementStatus::Failed, PayoutSettlementStatus::Reversed], true)) {
                return;
            }

            $settlement->forceFill([
                'status' => PayoutSettlementStatus::Completed,
                'track_id' => $result->trackerId ?? $settlement->track_id,
                'receipt_link' => $result->receiptLink ?? $settlement->receipt_link,
                'provider_data' => $result->payload,
                'failure_reason' => null,
                'submitted_at' => $submitted ? ($settlement->submitted_at ?? now()) : $settlement->submitted_at,
                'last_checked_at' => now(),
                'paid_at' => now(),
            ])->save();

            $settlement->transaction()->update([
                'status' => WalletTransactionStatus::Completed->value,
            ]);
        });
    }

    private function markProcessing(int $settlementId, BankTransferResult $result, bool $submitted): void
    {
        DB::transaction(function () use ($result, $settlementId, $submitted): void {
            $settlement = PayoutSettlement::query()->whereKey($settlementId)->lockForUpdate()->firstOrFail();

            if (! in_array($settlement->status, [PayoutSettlementStatus::Pending, PayoutSettlementStatus::Processing], true)) {
                return;
            }

            $settlement->forceFill([
                'status' => PayoutSettlementStatus::Processing,
                'track_id' => $result->trackerId ?? $settlement->track_id,
                'receipt_link' => $result->receiptLink ?? $settlement->receipt_link,
                'provider_data' => $result->payload,
                'failure_reason' => null,
                'submitted_at' => $submitted ? ($settlement->submitted_at ?? now()) : $settlement->submitted_at,
                'last_checked_at' => now(),
            ])->save();

            $settlement->transaction()->update([
                'status' => WalletTransactionStatus::Processing->value,
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function failAndRefund(
        int $settlementId,
        string $reason,
        PayoutSettlementStatus $status,
        array $payload = [],
        ?BankTransferResult $result = null,
    ): void {
        DB::transaction(function () use ($payload, $reason, $result, $settlementId, $status): void {
            $settlement = PayoutSettlement::query()
                ->with('transaction')
                ->whereKey($settlementId)
                ->lockForUpdate()
                ->firstOrFail();

            if (in_array($settlement->status, [
                PayoutSettlementStatus::Completed,
                PayoutSettlementStatus::Failed,
                PayoutSettlementStatus::Reversed,
                PayoutSettlementStatus::Cancelled,
            ], true)) {
                return;
            }

            $transaction = $settlement->transaction;
            $wallet = Wallet::query()
                ->whereKey($transaction->user_id)
                ->lockForUpdate()
                ->firstOrFail();

            $wallet->forceFill([
                'balance' => $wallet->balance + $settlement->amount,
                'withdrawable_balance' => $wallet->withdrawable_balance + $settlement->amount,
            ])->save();

            $transactionPayload = $transaction->payload ?? [];
            $transactionPayload['settlement_refunded_at'] = now()->toISOString();
            $transactionPayload['settlement_refund_reason'] = $reason;

            $transaction->forceFill([
                'status' => $status === PayoutSettlementStatus::Reversed
                    ? WalletTransactionStatus::Reversed
                    : WalletTransactionStatus::Failed,
                'payload' => $transactionPayload,
            ])->save();

            $settlement->forceFill([
                'status' => $status,
                'track_id' => $result?->trackerId ?? $settlement->track_id,
                'receipt_link' => $result?->receiptLink ?? $settlement->receipt_link,
                'provider_data' => $payload,
                'failure_reason' => $reason,
                'last_checked_at' => now(),
            ])->save();
        });
    }
}
