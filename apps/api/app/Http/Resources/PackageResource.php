<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'currency' => $this->currency,
            'features' => $this->features,
            'media' => $this->media,
            'status' => $this->status,
            'views' => $this->views,
            'sales' => $this->sales,
            'user' => new UserResource($this->whenLoaded('user')),
            'platform_configs' => PackagePlatformConfigResource::collection($this->whenLoaded('platformConfigs')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
