<?php

namespace App\Listeners;

use App\Events\ContractCompleted;
use App\Jobs\Contracts\EnsureContractSnapshotJob;
use App\Jobs\Contracts\SendCompletedContractSmsJob;

class DispatchContractCompletedJobs
{
    public function handle(ContractCompleted $event): void
    {
        EnsureContractSnapshotJob::dispatch($event->contractId);
        SendCompletedContractSmsJob::dispatch($event->contractId);
    }
}
