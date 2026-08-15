<?php

namespace App\Actions\Contracts;

use App\Enums\ContractStatus;
use App\Models\Contract;
use App\Models\Package;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateContractAction
{
    public function execute(User $employer, ?Package $package, array $data): Contract
    {
        return DB::transaction(function () use ($employer, $package, $data): Contract {
            $contract = new Contract($data);
            $contract->user_id = $employer->id;
            $contract->client_id = $data['client_id'] ?? $employer->id;
            $contract->package_id = $package?->id;
            $contract->status = ContractStatus::Draft->value;
            $contract->save();

            return $contract->load(['user', 'client', 'package', 'reviews']);
        });
    }
}
