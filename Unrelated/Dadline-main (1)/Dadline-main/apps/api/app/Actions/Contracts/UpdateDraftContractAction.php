<?php

namespace App\Actions\Contracts;

use App\Enums\ContractEventType;
use App\Models\Contract;
use App\Models\User;
use App\Services\Contracts\ContractEventLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateDraftContractAction
{
    public function __construct(
        private ContractEventLogger $events
    ) {}

    /**
     * @param  array{title?: string, body?: string}  $data
     */
    public function execute(
        Contract $contract,
        array $data,
        ?User $actor = null,
        ?Request $request = null
    ): Contract {
        if (! $contract->isDraft()) {
            throw ValidationException::withMessages([
                'contract' => 'Only draft contracts can be edited.',
            ]);
        }

        return DB::transaction(function () use ($contract, $data, $actor, $request): Contract {
            $before = $contract->only(['title', 'body']);
            $contract->fill(array_intersect_key($data, array_flip(['title', 'body'])));
            $contract->save();

            $this->events->record(
                contract: $contract,
                type: ContractEventType::DraftUpdated,
                actor: $actor,
                data: [
                    'changed_fields' => array_keys($contract->getChanges()),
                    'previous_body_hash' => hash('sha256', (string) $before['body']),
                    'new_body_hash' => hash('sha256', $contract->body),
                ],
                request: $request
            );

            return $contract->refresh();
        });
    }
}
