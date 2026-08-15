<?php

namespace App\Actions\Payments;

use App\Enums\PaymentGateway;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class InitiateSepPaymentAction
{
    public function execute(User $user, int $amount, array $payload = []): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $payload): WalletTransaction {
            return WalletTransaction::query()->create([
                'user_id' => $user->id,
                'amount' => $amount,
                'direction' => 'deposit',
                'type' => 'online_charge',
                'status' => 'pending',
                'payload' => array_merge($payload, ['gateway' => PaymentGateway::Sep->value]),
            ]);
        });
    }
}
