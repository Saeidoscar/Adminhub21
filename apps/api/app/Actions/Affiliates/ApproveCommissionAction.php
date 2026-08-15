<?php

namespace App\Actions\Affiliates;

use App\Models\AffiliateCommission;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class ApproveCommissionAction
{
    public function execute(AffiliateCommission $commission): AffiliateCommission
    {
        return DB::transaction(function () use ($commission): AffiliateCommission {
            $transaction = WalletTransaction::query()->create([
                'user_id' => $commission->affiliate->user_id,
                'amount' => $commission->amount,
                'direction' => 'deposit',
                'type' => 'affiliate_commission',
                'status' => 'completed',
            ]);

            $commission->status = 'paid';
            $commission->commission_tx_id = $transaction->id;
            $commission->save();

            return $commission;
        });
    }
}
