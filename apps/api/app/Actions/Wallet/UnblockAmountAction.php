<?php

namespace App\Actions\Wallet;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class UnblockAmountAction
{
    public function execute(User $user, int $amount): Wallet
    {
        return DB::transaction(function () use ($user, $amount): Wallet {
            $wallet = Wallet::query()
                ->whereKey($user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $amount = min($amount, $wallet->blocked_balance);

            $wallet->blocked_balance -= $amount;
            $wallet->withdrawable_balance += $amount;
            $wallet->save();

            return $wallet;
        });
    }
}
