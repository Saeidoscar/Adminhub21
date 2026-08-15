<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Enums\ContractEventType;
use App\Enums\ContractStatus;
use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Services\Contracts\ContractQrCodeService;
use Illuminate\Http\JsonResponse;

class PublicContractVerificationController extends Controller
{
    public function show(string $trackingCode, ContractQrCodeService $qrCodes): JsonResponse
    {
        $contract = Contract::query()
            ->where('tracking_code', $trackingCode)
            ->where('status', ContractStatus::Completed->value)
            ->with(['creator', 'qr', 'snapshot', 'signatures'])
            ->firstOrFail();

        $completedAt = $contract->events()
            ->where('event_type', ContractEventType::Completed->value)
            ->latest('occurred_at')
            ->value('occurred_at');
        $snapshot = $contract->snapshot;
        $currentBodyHash = hash('sha256', $contract->body);
        $qr = $contract->qr ?: $qrCodes->ensureForContract($contract);

        return response()->json([
            'data' => [
                'trackingCode' => $contract->tracking_code,
                'verificationUrl' => $qrCodes->verificationUrl($contract),
                'qrUrl' => $qr?->getUrl(false),
                'title' => $contract->title,
                'status' => $contract->status,
                'statusLabel' => $contract->statusLabel(),
                'creator' => [
                    'name' => $contract->creator?->full_name,
                ],
                'createdAt' => $contract->created_at,
                'completedAt' => $completedAt,
                'hashAlgorithm' => $snapshot?->hash_algorithm ?? 'sha256',
                'bodyHash' => $snapshot?->body_hash,
                'currentBodyHash' => $currentBodyHash,
                'payloadHash' => $snapshot?->payload_hash,
                'hashMatchesCurrentBody' => $snapshot !== null && hash_equals($snapshot->body_hash, $currentBodyHash),
                'snapshotCreatedAt' => $snapshot?->created_at,
                'signatures' => $contract->signatures
                    ->sortBy('id')
                    ->values()
                    ->map(fn ($signature) => [
                        'fullName' => $signature->full_name,
                        'mobile' => $this->maskMobile($signature->mobile),
                        'status' => $signature->signature_status,
                        'statusLabel' => $signature->statusLabel(),
                        'signedAt' => $signature->signed_at,
                    ]),
            ],
        ]);
    }

    private function maskMobile(?string $mobile): ?string
    {
        if (blank($mobile) || strlen($mobile) < 7) {
            return $mobile;
        }

        return substr($mobile, 0, 4).'***'.substr($mobile, -4);
    }
}
