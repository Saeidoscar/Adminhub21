<?php

namespace App\Actions\Wallet;

use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class WithdrawAction
{
    public function execute(User $user, int $amount, WalletTransactionType $type): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $type): WalletTransaction {
            $wallet = Wallet::query()
                ->whereKey($user->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($wallet->withdrawable_balance < $amount) {
                throw new \RuntimeException('Insufficient withdrawable balance.');
            }

            $wallet->balance -= $amount;
            $wallet->withdrawable_balance -= $amount;
            $wallet->save();

            return WalletTransaction::query()->create([
                'user_id' => $user->id,
                'amount' => $amount,
                'direction' => WalletTransactionDirection::Withdrawal,
                'type' => $type,
                'status' => WalletTransactionStatus::Pending,
            ]);
        });
    }
}
