<?php

namespace App\Http\Resources\Contracts;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $user?->loadMissing(['profile.avatar', 'profile.signature', 'verification']);

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'creatorId' => $this->creator_id,
            'title' => $this->title,
            'body' => $this->when($request->routeIs('*.show') || ! $request->isMethod('get'), $this->body),
            'status' => $this->status,
            'statusLabel' => $this->statusLabel(),
            'trackingCode' => $this->tracking_code,
            'pinCode' => $this->when((int) $request->user()?->id === (int) $this->creator_id, $this->pin_code),
            'qrId' => $this->qr_id,
            'qrUrl' => $this->qr?->getUrl(false),
            'verificationUrl' => blank($this->tracking_code)
                ? null
                : rtrim(config('app.contract_public_url', 'https://dadline.net'), '/').'/contract/'.$this->tracking_code,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator?->id,
                'name' => $this->creator?->full_name,
                'mobile' => $this->creator?->mobile,
            ]),
            'attachments' => ContractAttachmentResource::collection($this->whenLoaded('attachments')),
            'signatures' => SignatureResource::collection($this->whenLoaded('signatures')),
            'snapshot' => new ContractSnapshotResource($this->whenLoaded('snapshot')),
            'aiAnalysis' => new ContractAiAnalysisResource($this->whenLoaded('aiAnalysis')),
            'currentUser' => $this->when($user !== null, fn () => [
                'id' => $user?->id,
                'name' => $user?->full_name,
                'mobile' => $user?->mobile,
                'profile' => [
                    'avatarId' => $user?->profile?->avatar_id,
                    'avatarUrl' => $user?->profile?->avatar?->getUrl(false),
                    'signatureId' => $user?->profile?->signature_id,
                    'signatureUrl' => $user?->profile?->signature?->getUrl(false),
                ],
                'verification' => [
                    'verifiedLevel' => $user?->verification?->verified_level ?? 0,
                    'isLevelTwoVerified' => $user?->verification?->isVerified() === true,
                    'mobileVerified' => $user?->verification?->mobile_verified ?? false,
                    'nationalVerified' => $user?->verification?->national_verified ?? false,
                    'bankVerified' => $user?->verification?->bank_verified ?? false,
                ],
            ]),
        ];
    }
}
