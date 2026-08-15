<?php

namespace App\Jobs\Settlements;

use App\Services\Settlements\PayoutSettlementService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class SubmitPayoutSettlementJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    /** @var array<int, int> */
    public array $backoff = [30, 120, 300, 900];

    public function __construct(public readonly int $settlementId) {}

    public function handle(PayoutSettlementService $settlements): void
    {
        $settlements->submit($this->settlementId);
    }

    public function failed(Throwable $exception): void
    {
        app(PayoutSettlementService::class)->recordTechnicalFailure(
            $this->settlementId,
            $exception->getMessage(),
        );
    }
}
