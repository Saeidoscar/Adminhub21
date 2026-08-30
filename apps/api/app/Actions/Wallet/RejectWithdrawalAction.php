<?php

namespace App\Actions\Wallet;

use App\Enums\WalletTransactionStatus;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class RejectWithdrawalAction
{
    public function execute(WalletTransaction $transaction): WalletTransaction
    {
        return DB::transaction(function () use ($transaction): WalletTransaction {
            if ($transaction->status !== WalletTransactionStatus::Pending) {
                throw new \RuntimeException('Only pending withdrawals can be rejected.');
            }

            $wallet = Wallet::query()
                ->whereKey($transaction->user_id)
                ->lockForUpdate()
                ->firstOrFail();

            $wallet->balance += $transaction->amount;
            $wallet->withdrawable_balance += $transaction->amount;
            $wallet->save();

            $transaction->status = WalletTransactionStatus::Cancelled;
            $transaction->save();

            return $transaction->refresh();
        });
    }
}
