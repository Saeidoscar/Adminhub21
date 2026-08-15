<?php

namespace App\Services\Payouts;

use App\Enums\PayoutSettlementStatus;
use App\Models\PayoutSettlement;
use App\Models\WalletTransaction;
use App\Actions\Payouts\SchedulePayoutAction;
use App\Actions\Payouts\TrackPayoutStatusAction;

class PayoutSettlementService
{
    public function __construct(
        private readonly SchedulePayoutAction $schedule,
        private readonly TrackPayoutStatusAction $track,
    ) {}

    public function schedule(WalletTransaction $transaction, array $details): PayoutSettlement
    {
        return $this->schedule->execute($transaction, $details);
    }

    public function trackStatus(PayoutSettlement $settlement, PayoutSettlementStatus $status, ?string $failureReason = null): PayoutSettlement
    {
        return $this->track->execute($settlement, $status, $failureReason);
    }
}
