<?php

namespace App\Actions\Contracts;

use App\Enums\ContractStatus;
use App\Models\Contract;
use Illuminate\Support\Facades\DB;

class ActivateContractAction
{
    public function execute(Contract $contract): Contract
    {
        return DB::transaction(function () use ($contract): Contract {
            $contract->status = ContractStatus::Active->value;
            $contract->starts_at = now();
            $contract->save();

            return $contract;
        });
    }
}
