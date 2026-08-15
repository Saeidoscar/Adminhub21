<?php

namespace App\Http\Resources\Contracts;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractSnapshotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contractId' => $this->contract_id,
            'bodyHash' => $this->body_hash,
            'payloadHash' => $this->payload_hash,
            'hashAlgorithm' => $this->hash_algorithm,
            'canonicalPayload' => $this->canonical_payload,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
