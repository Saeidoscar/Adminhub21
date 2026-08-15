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
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'role_label' => $this->role_label,
            'avatar' => $this->avatar,
            'bio' => $this->bio,
            'is_verified' => $this->is_verified,
            'is_banned' => $this->is_banned,
            'timezone' => $this->timezone,
            'locale' => $this->locale,
        ];
    }
}
