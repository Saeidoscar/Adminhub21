<?php

namespace App\Actions\Wallet;

use App\Enums\WalletTransactionDirection;
use App\Exceptions\InsufficientFundsException;
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
                ->first();

            if ($senderWallet === null || $senderWallet->withdrawable_balance < $amount) {
                throw new InsufficientFundsException();
            }

            // Create-then-lock: firstOrCreate() cannot take a row lock on a row
            // that does not exist yet.
            Wallet::query()->firstOrCreate(
                ['user_id' => $receiver->id],
                ['balance' => 0, 'blocked_balance' => 0, 'withdrawable_balance' => 0]
            );

            $receiverWallet = Wallet::query()
                ->whereKey($receiver->id)
                ->lockForUpdate()
                ->firstOrFail();

            $senderWallet->balance -= $amount;
            $senderWallet->withdrawable_balance -= $amount;
            $senderWallet->save();

            $receiverWallet->balance += $amount;
            $receiverWallet->withdrawable_balance += $amount;
            $receiverWallet->save();

            $transaction = WalletTransaction::query()->create([
                'user_id' => $sender->id,
                'amount' => $amount,
                'direction' => WalletTransactionDirection::Withdrawal,
                'type' => $type,
                'status' => WalletTransactionStatus::Completed,
                'payload' => ['receiver_id' => $receiver->id],
            ]);

            // Without this, the receiver's balance changes with nothing in
            // their statement to explain it.
            WalletTransaction::query()->create([
                'user_id' => $receiver->id,
                'amount' => $amount,
                'direction' => WalletTransactionDirection::Deposit,
                'type' => $type,
                'status' => WalletTransactionStatus::Completed,
                'payload' => ['sender_id' => $sender->id, 'transfer_id' => $transaction->id],
            ]);

            return $transaction;
        });
    }
}
