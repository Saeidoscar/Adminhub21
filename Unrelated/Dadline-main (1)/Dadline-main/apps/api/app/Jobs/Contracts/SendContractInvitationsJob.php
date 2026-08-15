<?php

namespace App\Jobs\Contracts;

use App\Enums\ContractEventType;
use App\Models\Contract;
use App\Services\Contracts\ContractEventLogger;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendContractInvitationsJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $contractId
    ) {}

    public function handle(ContractEventLogger $events): void
    {
        $contract = Contract::query()->with('signatures')->find($this->contractId);

        if ($contract === null) {
            return;
        }

        foreach ($contract->signatures as $signature) {
            if ((int) $signature->user_id === (int) $contract->creator_id) {
                continue;
            }

            Log::info('Contract invitation SMS queued for provider delivery', [
                'contract_id' => $contract->id,
                'signature_id' => $signature->id,
                'mobile' => $signature->mobile,
            ]);

            SendContractInvitationSmsJob::dispatch(
                contractId: $contract->id,
                signatureId: $signature->id,
                mobile: (string) $signature->mobile,
            );

            $events->record(
                contract: $contract,
                type: ContractEventType::InviteSent,
                data: [
                    'signature_id' => $signature->id,
                    'mobile' => $signature->mobile,
                ]
            );
        }
    }
}
