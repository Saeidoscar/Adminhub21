<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficeMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'office_id' => $this->office_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'role' => $this->role,
            'can_access' => $this->can_access,
            'permissions' => $this->permissions,
            'created_at' => $this->created_at,
        ];
    }
}
