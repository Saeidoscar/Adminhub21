<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'media' => $this->media,
            'user' => new UserResource($this->whenLoaded('user')),
            'target_user' => new UserResource($this->whenLoaded('targetUser')),
            'contract' => new ContractResource($this->whenLoaded('contract')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
