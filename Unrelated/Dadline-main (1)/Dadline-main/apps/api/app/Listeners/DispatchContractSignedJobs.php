<?php

namespace App\Listeners;

use App\Events\ContractSigned;
use App\Jobs\Contracts\CompleteContractIfFullySignedJob;

class DispatchContractSignedJobs
{
    public function handle(ContractSigned $event): void
    {
        CompleteContractIfFullySignedJob::dispatch($event->contractId);
    }
}
