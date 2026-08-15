<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'milestones' => $this->milestones,
            'signed_at' => $this->signed_at,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'client' => new UserResource($this->whenLoaded('client')),
            'package' => new PackageResource($this->whenLoaded('package')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
