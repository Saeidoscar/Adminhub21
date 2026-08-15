<?php

namespace App\Actions\Contracts;

use App\Models\Signature;
use Illuminate\Validation\ValidationException;

class UpdateSignatureAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Signature $signature, array $data): Signature
    {
        if (! $signature->contract->isDraft()) {
            throw ValidationException::withMessages([
                'contract' => 'Only draft contracts can be edited.',
            ]);
        }

        $values = array_intersect_key($data, array_flip(['user_id', 'full_name', 'mobile']));
        $values['user_id'] = $this->resolveUserId($signature, $values);

        $signature->fill($values);
        $signature->save();

        return $signature->refresh();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function resolveUserId(Signature $signature, array $data): ?int
    {
        if (array_key_exists('user_id', $data) && $data['user_id'] !== null) {
            return (int) $data['user_id'];
        }

        $contract = $signature->contract;
        $mobile = $data['mobile'] ?? $signature->mobile;

        if ($mobile !== $contract->creator?->mobile) {
            return array_key_exists('mobile', $data) ? null : $signature->user_id;
        }

        return (int) $contract->creator_id;
    }
}
