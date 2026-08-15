<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'status' => $this->status,
            'holiday' => $this->holiday,
            'owner' => new UserResource($this->whenLoaded('owner')),
            'members' => OfficeMemberResource::collection($this->whenLoaded('members')),
            'cases' => OfficeCaseResource::collection($this->whenLoaded('cases')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
