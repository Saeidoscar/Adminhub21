<?php

namespace App\Actions\Payouts;

use App\Enums\PayoutSettlementStatus;
use App\Models\PayoutSettlement;
use Illuminate\Support\Facades\DB;

class TrackPayoutStatusAction
{
    public function execute(PayoutSettlement $settlement, PayoutSettlementStatus $status, ?string $failureReason = null): PayoutSettlement
    {
        return DB::transaction(function () use ($settlement, $status, $failureReason): PayoutSettlement {
            $settlement->status = $status->value;
            $settlement->last_checked_at = now();

            if ($status === PayoutSettlementStatus::Completed) {
                $settlement->paid_at = now();
            }

            if ($failureReason !== null) {
                $settlement->failure_reason = $failureReason;
            }

            $settlement->save();

            return $settlement;
        });
    }
}
