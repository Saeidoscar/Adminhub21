<?php

namespace App\Actions\Wallet;

use App\Enums\WalletTransactionStatus;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class ApproveWithdrawalAction
{
    public function execute(WalletTransaction $transaction): WalletTransaction
    {
        return DB::transaction(function () use ($transaction): WalletTransaction {
            if ($transaction->status !== WalletTransactionStatus::Pending) {
                throw new \RuntimeException('Only pending withdrawals can be approved.');
            }

            $transaction->status = WalletTransactionStatus::Completed;
            $transaction->save();

            return $transaction->refresh();
        });
    }
}
