<?php

namespace App\Actions\Payouts;

use App\Enums\PayoutSettlementStatus;
use App\Models\PayoutSettlement;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class SchedulePayoutAction
{
    /**
     * @param  array<string, mixed>  $details
     */
    public function execute(WalletTransaction $transaction, array $details): PayoutSettlement
    {
        return DB::transaction(function () use ($transaction, $details): PayoutSettlement {
            return PayoutSettlement::query()->create([
                'transaction_id' => $transaction->id,
                'amount' => $transaction->amount,
                'total_payable' => $transaction->amount - ($details['fee'] ?? 0),
                'fee' => $details['fee'] ?? 0,
                'provider' => $details['provider'] ?? null,
                'iban' => $details['iban'] ?? null,
                'crypto_address' => $details['crypto_address'] ?? null,
                'unique_code' => $details['unique_code'] ?? null,
                'scheduled_for' => $details['scheduled_for'] ?? now(),
                'status' => PayoutSettlementStatus::Pending->value,
            ]);
        });
    }
}
