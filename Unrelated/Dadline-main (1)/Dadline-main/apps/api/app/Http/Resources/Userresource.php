<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'role' => $this->role->value,
            'roles' => [$this->role->value],
            'avatar' => $this->profile?->avatar?->getUrl(false),
            'balance' => 50000,
            'token' => 3000,
            'tasks' => [],
        ];
    }
}
