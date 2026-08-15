<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicQuestionAnswerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'body' => $this->body,
            'createdAt' => $this->created_at?->diffForHumans(),
            'vendor' => $this->whenLoaded('vendor', fn () => [
                'name' => $this->vendor?->full_name,
                'slug' => $this->vendor?->vendorProfile?->slug,
                'type' => $this->vendor?->vendorProfile?->vendor_type?->value,
                'profilePath' => $this->profilePath(),
                'role' => $this->vendor?->role?->label(),
                'avatar' => $this->vendor?->profile?->avatar?->getUrl(),
                'rating' => round((float) ($this->vendor?->approved_reviews_avg_rate ?? 0), 1),
                'reviewCount' => (int) ($this->vendor?->approved_reviews_count ?? 0),
            ]),
        ];
    }

    private function profilePath(): ?string
    {
        $type = $this->vendor?->vendorProfile?->vendor_type?->value;
        $slug = $this->vendor?->vendorProfile?->slug;

        return in_array($type, ['lawyer', 'expert'], true) && $slug
            ? "/{$type}/{$slug}"
            : null;
    }
}
