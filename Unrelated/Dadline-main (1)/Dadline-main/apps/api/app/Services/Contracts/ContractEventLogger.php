<?php

namespace App\Services\Contracts;

use App\Enums\ContractEventType;
use App\Models\Contract;
use App\Models\ContractEvent;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;

class ContractEventLogger
{
    /**
     * @param  array<string, mixed>|null  $data
     */
    public function record(
        Contract $contract,
        ContractEventType|string $type,
        ?User $actor = null,
        ?array $data = null,
        ?Request $request = null,
        ?CarbonInterface $occurredAt = null
    ): ContractEvent {
        return ContractEvent::query()->create([
            'contract_id' => $contract->id,
            'actor_id' => $actor?->id,
            'event_type' => $type instanceof ContractEventType ? $type->value : $type,
            'event_data' => $data,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'occurred_at' => $occurredAt ?? now(),
        ]);
    }
}
