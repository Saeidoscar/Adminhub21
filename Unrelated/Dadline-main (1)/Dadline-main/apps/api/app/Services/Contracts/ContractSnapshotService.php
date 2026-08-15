<?php

namespace App\Services\Contracts;

use App\Enums\ContractEventType;
use App\Models\Contract;
use App\Models\ContractSnapshot;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContractSnapshotService
{
    public function __construct(
        private ContractEventLogger $events
    ) {}

    public function createForContract(
        Contract $contract,
        ?User $actor = null,
        ?Request $request = null
    ): ContractSnapshot {
        return DB::transaction(function () use ($contract, $actor, $request): ContractSnapshot {
            $contract = $contract->fresh(['signatures', 'attachments']);
            $payload = $this->canonicalPayload($contract);
            $json = $this->canonicalJson($payload);
            $snapshot = ContractSnapshot::query()->firstOrCreate(
                ['contract_id' => $contract->id],
                [
                    'body_hash' => hash('sha256', $contract->body),
                    'payload_hash' => hash('sha256', $json),
                    'hash_algorithm' => 'sha256',
                    'canonical_payload' => $payload,
                ]
            );

            if ($snapshot->wasRecentlyCreated) {
                $this->events->record(
                    contract: $contract,
                    type: ContractEventType::SnapshotCreated,
                    actor: $actor,
                    data: [
                        'snapshot_id' => $snapshot->id,
                        'body_hash' => $snapshot->body_hash,
                        'payload_hash' => $snapshot->payload_hash,
                        'hash_algorithm' => $snapshot->hash_algorithm,
                    ],
                    request: $request
                );
            }

            return $snapshot;
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function canonicalPayload(Contract $contract): array
    {
        return $this->sortKeys([
            'contract_id' => $contract->id,
            'contract_uuid' => $contract->uuid,
            'creator_id' => $contract->creator_id,
            'title' => $contract->title,
            'tracking_code' => $contract->tracking_code,
            'status' => $contract->status,
            'created_at' => $contract->created_at?->toJSON(),
            'updated_at' => $contract->updated_at?->toJSON(),
            'attachments' => $contract->attachments
                ->sortBy('sort_order')
                ->map(fn ($attachment): array => $this->sortKeys([
                    'id' => $attachment->id,
                    'attachment_id' => $attachment->attachment_id,
                    'sort_order' => $attachment->sort_order,
                ]))
                ->values()
                ->all(),
            'signatures' => $contract->signatures
                ->sortBy('id')
                ->map(fn ($signature): array => $this->sortKeys([
                    'id' => $signature->id,
                    'user_id' => $signature->user_id,
                    'full_name' => $signature->full_name,
                    'mobile' => $signature->mobile,
                    'signature_status' => $signature->signature_status,
                ]))
                ->values()
                ->all(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function canonicalJson(array $payload): string
    {
        return json_encode(
            $this->sortKeys($payload),
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
        );
    }

    /**
     * @param  array<string, mixed>  $value
     * @return array<string, mixed>
     */
    private function sortKeys(array $value): array
    {
        ksort($value);

        foreach ($value as $key => $item) {
            if (is_array($item)) {
                $value[$key] = $this->sortKeys($item);
            }
        }

        return $value;
    }
}
