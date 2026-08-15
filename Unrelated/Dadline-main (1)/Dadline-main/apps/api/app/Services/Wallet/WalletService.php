<?php

namespace App\Services\Wallet;

use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Validation\ValidationException;

class WalletService
{
    public function ensureWallet(User $user): Wallet
    {
        return Wallet::query()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'balance' => 0,
                'blocked_balance' => 0,
                'withdrawable_balance' => 0,
            ]
        );
    }

    public function spendableBalance(Wallet $wallet): int
    {
        return (int) $wallet->balance;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function createPendingOnlineCharge(User $user, int $amount, array $payload = []): WalletTransaction
    {
        $this->ensurePositiveAmount($amount);
        $this->ensureWallet($user);

        return WalletTransaction::query()->create([
            'user_id' => $user->id,
            'amount' => $amount,
            'direction' => WalletTransactionDirection::Deposit,
            'type' => WalletTransactionType::OnlineCharge,
            'status' => WalletTransactionStatus::Pending,
            'payload' => $payload,
        ]);
    }

    /**
     * Online charges for purchases are internal credit, so they are blocked
     * until consumed by Dadline services instead of becoming withdrawable.
     */
    public function completeBlockedDeposit(WalletTransaction $transaction): WalletTransaction
    {
        if (! $transaction->isDeposit()) {
            throw ValidationException::withMessages([
                'transaction' => 'Only deposit transactions can charge a wallet.',
            ]);
        }

        if ($transaction->status === WalletTransactionStatus::Completed) {
            return $transaction;
        }

        $wallet = Wallet::query()
            ->whereKey($transaction->user_id)
            ->lockForUpdate()
            ->firstOrFail();

        $wallet->forceFill([
            'balance' => $wallet->balance + $transaction->amount,
            'blocked_balance' => $wallet->blocked_balance + $transaction->amount,
        ])->save();

        $transaction->forceFill([
            'status' => WalletTransactionStatus::Completed,
        ])->save();

        return $transaction->refresh();
    }

    public function completeWithdrawableDeposit(WalletTransaction $transaction): WalletTransaction
    {
        if (! $transaction->isDeposit()) {
            throw ValidationException::withMessages([
                'transaction' => 'Only deposit transactions can charge a wallet.',
            ]);
        }

        if ($transaction->status === WalletTransactionStatus::Completed) {
            return $transaction;
        }

        $wallet = Wallet::query()
            ->whereKey($transaction->user_id)
            ->lockForUpdate()
            ->firstOrFail();

        $wallet->forceFill([
            'balance' => $wallet->balance + $transaction->amount,
            'withdrawable_balance' => $wallet->withdrawable_balance + $transaction->amount,
        ])->save();

        $transaction->forceFill([
            'status' => WalletTransactionStatus::Completed,
        ])->save();

        return $transaction->refresh();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function withdrawForPurchase(
        User $user,
        int $amount,
        WalletTransactionType $type,
        array $payload = []
    ): WalletTransaction {
        $this->ensurePositiveAmount($amount);

        $wallet = Wallet::query()
            ->whereKey($user->id)
            ->lockForUpdate()
            ->firstOrFail();

        if ($this->spendableBalance($wallet) < $amount) {
            throw ValidationException::withMessages([
                'wallet' => 'Wallet balance is not enough for this purchase.',
            ]);
        }

        $blockedReduction = min($wallet->blocked_balance, $amount);
        $remaining = $amount - $blockedReduction;
        $withdrawableReduction = min($wallet->withdrawable_balance, $remaining);

        $wallet->forceFill([
            'balance' => $wallet->balance - $amount,
            'blocked_balance' => $wallet->blocked_balance - $blockedReduction,
            'withdrawable_balance' => $wallet->withdrawable_balance - $withdrawableReduction,
        ])->save();

        return WalletTransaction::query()->create([
            'user_id' => $user->id,
            'amount' => $amount,
            'direction' => WalletTransactionDirection::Withdrawal,
            'type' => $type,
            'status' => WalletTransactionStatus::Completed,
            'payload' => $payload,
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function addBlockedCommission(User $user, int $amount, array $payload = []): WalletTransaction
    {
        $this->ensurePositiveAmount($amount);
        $wallet = $this->ensureWallet($user);
        $wallet->refresh();

        $wallet->forceFill([
            'balance' => $wallet->balance + $amount,
            'blocked_balance' => $wallet->blocked_balance + $amount,
        ])->save();

        return WalletTransaction::query()->create([
            'user_id' => $user->id,
            'amount' => $amount,
            'direction' => WalletTransactionDirection::Deposit,
            'type' => WalletTransactionType::Marketing,
            'status' => WalletTransactionStatus::Completed,
            'payload' => $payload,
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function addWithdrawableIncome(
        User $user,
        int $amount,
        WalletTransactionType $type,
        array $payload = []
    ): WalletTransaction {
        $this->ensurePositiveAmount($amount);
        $this->ensureWallet($user);

        $wallet = Wallet::query()
            ->whereKey($user->id)
            ->lockForUpdate()
            ->firstOrFail();

        $wallet->forceFill([
            'balance' => $wallet->balance + $amount,
            'withdrawable_balance' => $wallet->withdrawable_balance + $amount,
        ])->save();

        return WalletTransaction::query()->create([
            'user_id' => $user->id,
            'amount' => $amount,
            'direction' => WalletTransactionDirection::Deposit,
            'type' => $type,
            'status' => WalletTransactionStatus::Completed,
            'payload' => $payload,
        ]);
    }

    public function releaseBlockedAmount(User $user, int $amount): void
    {
        $this->ensurePositiveAmount($amount);

        $wallet = Wallet::query()
            ->whereKey($user->id)
            ->lockForUpdate()
            ->firstOrFail();

        $amount = min($amount, $wallet->blocked_balance);

        $wallet->forceFill([
            'blocked_balance' => $wallet->blocked_balance - $amount,
            'withdrawable_balance' => $wallet->withdrawable_balance + $amount,
        ])->save();
    }

    private function ensurePositiveAmount(int $amount): void
    {
        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => 'Amount must be greater than zero.',
            ]);
        }
    }
}
