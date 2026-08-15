<?php

namespace App\Actions\Contracts;

use App\Models\Contract;
use App\Models\Signature;
use Illuminate\Validation\ValidationException;

class CreateSignatureAction
{
    /**
     * @param  array{user_id?: int|null, full_name?: string|null, mobile?: string|null}  $data
     */
    public function execute(Contract $contract, array $data): Signature
    {
        if (! $contract->isDraft()) {
            throw ValidationException::withMessages([
                'contract' => 'Only draft contracts can be edited.',
            ]);
        }

        return Signature::query()->create([
            'contract_id' => $contract->id,
            'user_id' => $this->resolveUserId($contract, $data),
            'full_name' => $data['full_name'] ?? null,
            'mobile' => $data['mobile'] ?? null,
            'signature_status' => 'pending',
        ]);
    }

    /**
     * @param  array{user_id?: int|null, full_name?: string|null, mobile?: string|null}  $data
     */
    private function resolveUserId(Contract $contract, array $data): ?int
    {
        if (array_key_exists('user_id', $data) && $data['user_id'] !== null) {
            return (int) $data['user_id'];
        }

        if (($data['mobile'] ?? null) !== $contract->creator?->mobile) {
            return null;
        }

        return (int) $contract->creator_id;
    }
}
