<?php

namespace App\Actions\Wallet;

use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class TransferAction
{
    public function execute(User $sender, User $receiver, int $amount, WalletTransactionType $type): WalletTransaction
    {
        return DB::transaction(function () use ($sender, $receiver, $amount, $type): WalletTransaction {
            $senderWallet = Wallet::query()
                ->whereKey($sender->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($senderWallet->withdrawable_balance < $amount) {
                throw new \RuntimeException('Insufficient withdrawable balance.');
            }

            $receiverWallet = Wallet::query()
                ->whereKey($receiver->id)
                ->lockForUpdate()
                ->firstOrCreate(
                    ['user_id' => $receiver->id],
                    ['balance' => 0, 'blocked_balance' => 0, 'withdrawable_balance' => 0]
                );

            $senderWallet->balance -= $amount;
            $senderWallet->withdrawable_balance -= $amount;
            $senderWallet->save();

            $receiverWallet->balance += $amount;
            $receiverWallet->withdrawable_balance += $amount;
            $receiverWallet->save();

            return WalletTransaction::query()->create([
                'user_id' => $sender->id,
                'amount' => $amount,
                'direction' => WalletTransactionDirection::Withdrawal,
                'type' => $type,
                'status' => WalletTransactionStatus::Completed,
                'payload' => ['receiver_id' => $receiver->id],
            ]);
        });
    }
}
