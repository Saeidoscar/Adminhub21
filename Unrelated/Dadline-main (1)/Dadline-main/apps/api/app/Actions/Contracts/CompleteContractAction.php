<?php

namespace App\Actions\Contracts;

use App\Enums\ContractEventType;
use App\Enums\ContractStatus;
use App\Events\ContractCompleted;
use App\Models\Contract;
use App\Models\User;
use App\Services\Contracts\ContractEventLogger;
use App\Services\Contracts\ContractQrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompleteContractAction
{
    public function __construct(
        private ContractEventLogger $events,
        private ContractQrCodeService $qrCodes
    ) {}

    public function execute(
        Contract $contract,
        ?User $actor = null,
        ?Request $request = null
    ): Contract {
        if ($contract->status !== ContractStatus::Active->value) {
            throw ValidationException::withMessages([
                'contract' => 'Only active contracts can be completed.',
            ]);
        }

        $unsignedCount = $contract->signatures()
            ->where('signature_status', '!=', 'signed')
            ->count();

        if ($unsignedCount > 0) {
            throw ValidationException::withMessages([
                'signatures' => 'All contract signatures must be signed before completion.',
            ]);
        }

        $contract = DB::transaction(function () use ($contract, $actor, $request): Contract {
            $contract->status = ContractStatus::Completed->value;
            $contract->save();
            $this->qrCodes->ensureForContract($contract);

            $this->events->record(
                contract: $contract,
                type: ContractEventType::Completed,
                actor: $actor,
                data: [
                    'previous_status' => ContractStatus::Active->value,
                    'previous_status_label' => ContractStatus::Active->label(),
                    'new_status' => ContractStatus::Completed->value,
                    'new_status_label' => ContractStatus::Completed->label(),
                ],
                request: $request
            );

            return $contract->refresh();
        });

        ContractCompleted::dispatch($contract->id);

        return $contract;
    }
}
