<?php

namespace App\Actions\Contracts;

use App\Enums\ContractStatus;
use App\Models\Contract;
use Illuminate\Support\Facades\DB;

class CompleteContractAction
{
    public function execute(Contract $contract): Contract
    {
        return DB::transaction(function () use ($contract): Contract {
            $contract->status = ContractStatus::Completed->value;
            $contract->ends_at = now();
            $contract->save();

            return $contract;
        });
    }
}
