<?php

namespace App\Jobs\Contracts;

use App\Models\Contract;
use App\Services\Contracts\ContractSnapshotService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class EnsureContractSnapshotJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $contractId
    ) {}

    public function handle(ContractSnapshotService $snapshots): void
    {
        $contract = Contract::query()->find($this->contractId);

        if ($contract === null) {
            return;
        }

        $snapshots->createForContract($contract);
    }
}
