<?php

namespace App\Actions\Contracts;

use App\Models\Contract;
use App\Models\ContractAiAnalysis;

class UpsertContractAiAnalysisAction
{
    /**
     * @param  array{ai_data: array<string, mixed>, ai_content?: string|null}  $data
     */
    public function execute(Contract $contract, array $data): ContractAiAnalysis
    {
        return ContractAiAnalysis::query()->updateOrCreate(
            ['contract_id' => $contract->id],
            [
                'ai_data' => $data['ai_data'],
                'ai_content' => $data['ai_content'] ?? null,
            ]
        );
    }
}
