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
            $contract->save();

            return $contract;
        });
    }
}
