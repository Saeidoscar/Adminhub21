<?php

namespace App\Actions\Affiliates;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class TrackCommissionAction
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function execute(Affiliate $affiliate, WalletTransaction $sourceTransaction, array $payload = []): AffiliateCommission
    {
        return DB::transaction(function () use ($affiliate, $sourceTransaction, $payload): AffiliateCommission {
            $amount = (int) round($sourceTransaction->amount * (float) $affiliate->commission_rate);

            $commission = new AffiliateCommission($payload);
            $commission->affiliate_id = $affiliate->id;
            $commission->source_tx_id = $sourceTransaction->id;
            $commission->rate = $affiliate->commission_rate;
            $commission->amount = $amount;
            $commission->save();

            return $commission;
        });
    }
}
