<?php

namespace App\Actions\Wallet;

use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class DepositAction
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function execute(User $user, int $amount, WalletTransactionType $type, array $payload = []): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $type, $payload): WalletTransaction {
            $wallet = Wallet::query()->firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'blocked_balance' => 0, 'withdrawable_balance' => 0]
            );

            $wallet->balance += $amount;
            $wallet->withdrawable_balance += $amount;
            $wallet->save();

            return WalletTransaction::query()->create([
                'user_id' => $user->id,
                'amount' => $amount,
                'direction' => WalletTransactionDirection::Deposit,
                'type' => $type,
                'status' => WalletTransactionStatus::Completed,
                'payload' => $payload,
            ]);
        });
    }
}
