<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;

class ContractVerificationController extends Controller
{
    public function show(Contract $contract): JsonResponse
    {
        $this->authorize('view', $contract);

        $snapshot = $contract->snapshot;
        $currentBodyHash = hash('sha256', $contract->body);

        return response()->json([
            'contractId' => $contract->id,
            'uuid' => $contract->uuid,
            'trackingCode' => $contract->tracking_code,
            'status' => $contract->status,
            'statusLabel' => $contract->statusLabel(),
            'hashAlgorithm' => $snapshot?->hash_algorithm ?? 'sha256',
            'bodyHash' => $snapshot?->body_hash,
            'currentBodyHash' => $currentBodyHash,
            'payloadHash' => $snapshot?->payload_hash,
            'hashMatchesCurrentBody' => $snapshot !== null && hash_equals($snapshot->body_hash, $currentBodyHash),
            'snapshotCreatedAt' => $snapshot?->created_at,
        ]);
    }
}
