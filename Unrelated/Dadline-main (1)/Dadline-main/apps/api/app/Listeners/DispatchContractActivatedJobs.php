<?php

namespace App\Listeners;

use App\Events\ContractActivated;
use App\Jobs\Contracts\SendContractInvitationsJob;

class DispatchContractActivatedJobs
{
    public function handle(ContractActivated $event): void
    {
        SendContractInvitationsJob::dispatch($event->contractId);
    }
}
