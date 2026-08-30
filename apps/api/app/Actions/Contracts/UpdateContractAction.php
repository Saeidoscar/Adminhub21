<?php

namespace App\Actions\Contracts;

use App\Enums\ContractStatus;
use App\Models\Contract;
use Illuminate\Support\Facades\DB;

class UpdateContractAction
{
    public function execute(Contract $contract, array $data): Contract
    {
        return DB::transaction(function () use ($contract, $data): Contract {
            $contract->forceFill($data)->save();

            return $contract->load(['user', 'client', 'package', 'reviews', 'clauses']);
        });
    }
}
