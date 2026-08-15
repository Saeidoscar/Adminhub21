<?php

namespace App\Jobs\Contracts;

use App\Actions\Contracts\CompleteContractAction;
use App\Enums\ContractStatus;
use App\Models\Contract;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CompleteContractIfFullySignedJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $contractId
    ) {}

    public function handle(CompleteContractAction $completeContract): void
    {
        $contract = Contract::query()->with('signatures')->find($this->contractId);

        if ($contract === null || $contract->status !== ContractStatus::Active->value || $contract->signatures->isEmpty()) {
            return;
        }

        if ($contract->signatures->contains(fn ($signature): bool => $signature->signature_status !== 'signed')) {
            return;
        }

        $completeContract->execute($contract);
    }
}
