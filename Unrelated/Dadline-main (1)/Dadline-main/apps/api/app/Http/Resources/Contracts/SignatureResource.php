<?php

namespace App\Http\Resources\Contracts;

use App\Enums\ContractEventType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SignatureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $inviteSent = $this->latestEvent(ContractEventType::InviteSent);
        $viewedAt = $this->eventOccurredAt(ContractEventType::Viewed);
        $canResendInvitationAt = $inviteSent?->occurred_at?->copy()->addDay();
        $activityStatusLabel = match (true) {
            $this->signature_status === 'signed' => 'امضا شده',
            $this->user_id !== null => 'در انتظار امضا',
            default => 'دعوت‌نامه ارسال شده',
        };

        return [
            'id' => $this->id,
            'contractId' => $this->contract_id,
            'userId' => $this->user_id,
            'fullName' => $this->full_name,
            'mobile' => $this->mobile,
            'signatureStatus' => $this->signature_status,
            'signatureStatusLabel' => $this->statusLabel(),
            'activityStatusLabel' => $activityStatusLabel,
            'inviteSentAt' => $inviteSent?->occurred_at?->toJSON(),
            'canResendInvitationAt' => $canResendInvitationAt?->toJSON(),
            'canResendInvitation' => $inviteSent === null || $canResendInvitationAt?->isPast() === true,
            'viewedAt' => $viewedAt,
            'signatureId' => $this->signature_id,
            'signatureCode' => $this->verification_code,
            'signatureUrl' => $this->whenLoaded('signatureFile', fn () => $this->signatureFile?->getUrl(private: true)),
            'ipAddress' => $this->ip_address,
            'nationalId' => $this->whenLoaded('user', fn () => $this->user?->profile?->national_id),
            'birthDate' => $this->whenLoaded('user', fn () => $this->user?->profile?->birth_date),
            'signedAt' => $this->signed_at,
            'metadata' => $this->when($request->user()?->isAdmin() === true, $this->metadata),
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }

    private function eventOccurredAt(ContractEventType $type): ?string
    {
        return $this->latestEvent($type)
            ?->occurred_at
            ?->toJSON();
    }

    private function latestEvent(ContractEventType $type)
    {
        return $this->contract
            ->events()
            ->where('event_type', $type->value)
            ->where('event_data->signature_id', $this->id)
            ->latest('occurred_at')
            ->first();
    }
}
