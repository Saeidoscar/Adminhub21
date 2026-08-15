<?php

namespace App\Jobs\Settlements;

use App\Services\Settlements\PayoutSettlementService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class InquirePayoutSettlementJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var array<int, int> */
    public array $backoff = [30, 120, 300];

    public function __construct(public readonly int $settlementId) {}

    public function handle(PayoutSettlementService $settlements): void
    {
        $settlements->inquire($this->settlementId);
    }
}
