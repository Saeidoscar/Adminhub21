<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackagePlatformConfigResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'platform' => $this->platform,
            'posts_per_month' => $this->posts_per_month,
            'stories_per_month' => $this->stories_per_month,
            'reels_per_month' => $this->reels_per_month,
            'comments_per_month' => $this->comments_per_month,
            'deliverables' => $this->deliverables,
        ];
    }
}
