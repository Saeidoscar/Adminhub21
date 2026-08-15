<?php

namespace App\Actions\Contracts;

use App\Models\Contract;
use App\Models\User;
use Illuminate\Support\Str;

class CreateContractAction
{
    /**
     * @param  array{title: string, body: string, pin_code?: string|null}  $data
     */
    public function execute(User $creator, array $data): Contract
    {
        return Contract::query()->create([
            'uuid' => (string) Str::uuid(),
            'creator_id' => $creator->id,
            'title' => $data['title'],
            'body' => $data['body'],
            'pin_code' => $data['pin_code'] ?? (string) random_int(1000, 9999),
        ]);
    }
}
