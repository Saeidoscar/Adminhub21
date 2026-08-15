<?php

namespace App\Actions\Contracts;

use App\Enums\ContractEventType;
use App\Enums\ContractStatus;
use App\Jobs\Contracts\SendContractInvitationSmsJob;
use App\Models\Contract;
use App\Models\Signature;
use App\Models\User;
use App\Services\Contracts\ContractEventLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class SendContractInvitationAction
{
    public function __construct(
        private ContractEventLogger $events
    ) {}

    public function execute(Contract $contract, ?Signature $signature = null, ?User $actor = null, ?Request $request = null): void
    {
        if ($contract->status !== ContractStatus::Active->value) {
            throw ValidationException::withMessages([
                'contract' => 'Only active contracts can receive invitations.',
            ]);
        }

        $targets = $signature === null ? $contract->signatures : collect([$signature]);

        foreach ($targets as $target) {
            if ((int) $target->user_id === (int) $contract->creator_id) {
                continue;
            }

            $this->ensureCanSend($contract, $target);

            Log::info('Contract invitation SMS queued for provider delivery', [
                'contract_id' => $contract->id,
                'signature_id' => $target->id,
                'mobile' => $target->mobile,
            ]);

            SendContractInvitationSmsJob::dispatch(
                contractId: $contract->id,
                signatureId: $target->id,
                mobile: (string) $target->mobile,
            )->afterCommit();

            $this->events->record(
                contract: $contract,
                type: ContractEventType::InviteSent,
                actor: $actor,
                data: [
                    'signature_id' => $target->id,
                    'mobile' => $target->mobile,
                ],
                request: $request
            );
        }
    }

    private function ensureCanSend(Contract $contract, Signature $signature): void
    {
        $lastInviteSentAt = $contract->events()
            ->where('event_type', ContractEventType::InviteSent->value)
            ->where('event_data->signature_id', $signature->id)
            ->latest('occurred_at')
            ->first()
            ?->occurred_at;

        if ($lastInviteSentAt === null || $lastInviteSentAt->addDay()->isPast()) {
            return;
        }

        throw ValidationException::withMessages([
            'invitation' => 'ارسال مجدد دعوت‌نامه برای هر طرف قرارداد فقط هر ۲۴ ساعت یک‌بار امکان‌پذیر است.',
        ]);
    }
}
