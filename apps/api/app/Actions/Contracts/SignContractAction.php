<?php

namespace App\Actions\Contracts;

use App\Enums\ContractStatus;
use App\Models\Contract;
use Illuminate\Support\Facades\DB;

class SignContractAction
{
    public function execute(Contract $contract, array $signature): Contract
    {
        return DB::transaction(function () use ($contract, $signature): Contract {
            $signatures = $contract->signatures ?? [];
            $signatures[] = array_merge($signature, ['signed_at' => now()->toDateTimeString()]);
            $contract->signatures = $signatures;
            $contract->signed_at = now();

            // The first signature parks the contract in "pending"; activating it
            // is a separate, explicit step.
            if ($contract->status === ContractStatus::Draft->value) {
                $contract->status = ContractStatus::Pending->value;
            }

            $contract->save();

            return $contract;
        });
    }
}
