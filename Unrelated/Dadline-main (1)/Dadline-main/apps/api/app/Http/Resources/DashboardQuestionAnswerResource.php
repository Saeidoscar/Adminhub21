<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardQuestionAnswerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $review = $this->relationLoaded('reviews') ? $this->reviews->first() : null;

        return [
            'id' => $this->id,
            'body' => $this->body,
            'createdAt' => $this->created_at?->toIso8601String(),
            'vendor' => $this->whenLoaded('vendor', fn () => [
                'id' => $this->vendor?->id,
                'name' => $this->vendor?->full_name,
                'role' => $this->vendor?->role?->label(),
                'slug' => $this->vendor?->vendorProfile?->slug,
                'type' => $this->vendor?->vendorProfile?->vendor_type?->value,
                'profilePath' => $this->profilePath(),
                'avatar' => $this->vendor?->profile?->avatar?->getUrl(),
            ]),
            'review' => $review ? [
                'id' => $review->id,
                'rating' => (int) $review->rate,
                'review' => $review->review,
            ] : null,
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
