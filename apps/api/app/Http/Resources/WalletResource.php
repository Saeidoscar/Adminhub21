<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'balance' => $this->balance,
            'blocked_balance' => $this->blocked_balance,
            'withdrawable_balance' => $this->withdrawable_balance,
            'status' => $this->status,
        ];
    }
}
