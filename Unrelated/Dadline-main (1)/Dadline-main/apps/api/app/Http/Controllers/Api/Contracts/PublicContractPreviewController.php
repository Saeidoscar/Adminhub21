<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Enums\ContractStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contracts\VerifyContractPinRequest;
use App\Models\Contract;
use App\Services\Contracts\ContractPricingService;
use Illuminate\Http\JsonResponse;

class PublicContractPreviewController extends Controller
{
    public function pricing(ContractPricingService $pricing): JsonResponse
    {
        return response()->json([
            'data' => [
                'base_amount' => $pricing->basePrice(),
                'included_parties' => 2,
                'extra_party_rate' => 0.25,
                'currency' => 'IRT',
                'currency_label' => 'تومان',
            ],
        ]);
    }

    public function show(Contract $contract): JsonResponse
    {
        abort_unless($contract->status === ContractStatus::Draft->value, 404);

        return response()->json([
            'data' => $this->publicData($contract->load('creator'), false),
        ]);
    }

    public function verify(VerifyContractPinRequest $request, Contract $contract): JsonResponse
    {
        abort_unless($contract->status === ContractStatus::Draft->value, 404);

        $verified = hash_equals((string) $contract->pin_code, (string) $request->validated('pin_code'));

        return response()->json([
            'data' => $this->publicData($contract->load(['creator', 'attachments.attachment', 'signatures']), $verified),
        ]);
    }

    private function publicData(Contract $contract, bool $verified): array
    {
        return [
            'uuid' => $contract->uuid,
            'title' => $contract->title,
            'creator' => [
                'name' => $contract->creator?->full_name,
            ],
            'verified' => $verified,
            'body' => $verified ? $contract->body : null,
            'signatures' => $verified
                ? $contract->signatures->map(fn ($signature): array => [
                    'fullName' => $signature->full_name,
                    'mobile' => $signature->mobile,
                    'statusLabel' => $signature->statusLabel(),
                ])->values()
                : [],
            'attachments' => $verified
                ? $contract->attachments->map(fn ($attachment): array => [
                    'attachmentId' => $attachment->attachment_id,
                    'originalName' => $attachment->attachment?->original_name,
                    'mimeType' => $attachment->attachment?->mime_type,
                    'sizeBytes' => $attachment->attachment?->size_bytes,
                ])->values()
                : [],
        ];
    }
}
