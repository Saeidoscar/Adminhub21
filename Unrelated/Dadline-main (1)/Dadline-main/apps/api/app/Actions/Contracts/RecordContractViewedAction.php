<?php

namespace App\Actions\Contracts;

use App\Enums\ContractEventType;
use App\Models\Contract;
use App\Models\User;
use App\Services\Contracts\ContractEventLogger;
use Illuminate\Http\Request;

class RecordContractViewedAction
{
    public function __construct(
        private ContractEventLogger $events
    ) {}

    /**
     * @param  array<string, mixed>|null  $data
     */
    public function execute(
        Contract $contract,
        ?User $actor = null,
        ?Request $request = null,
        ?array $data = null
    ): void {
        $this->events->record(
            contract: $contract,
            type: ContractEventType::Viewed,
            actor: $actor,
            data: $data,
            request: $request
        );
    }
}
