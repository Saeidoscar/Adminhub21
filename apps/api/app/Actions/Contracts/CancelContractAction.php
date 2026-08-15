<?php

namespace App\Actions\Contracts;

use App\Enums\ContractStatus;
use App\Models\Contract;
use Illuminate\Support\Facades\DB;

class CancelContractAction
{
    public function execute(Contract $contract): Contract
    {
        return DB::transaction(function () use ($contract): Contract {
            $contract->status = ContractStatus::Cancelled->value;
            $contract->save();

            return $contract;
        });
    }
}
