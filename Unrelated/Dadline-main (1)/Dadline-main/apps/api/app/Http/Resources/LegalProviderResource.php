<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LegalProviderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'name' => $this->full_name,

            'type' => $this->vendorProfile?->vendor_type?->value,

            'role' => $this->role->label(),

            'slug' => $this->vendorProfile?->slug,

            'online' => $this->isOnline(),

            'recomended' => false,

            'lastActive' => optional($this->lastSeen())?->diffForHumans(),

            'city' => [
                'id' => $this->profile?->city?->id,
                'name' => $this->profile?->city?->name,
                'slug' => $this->profile?->city?->slug,
            ],

            'province' => [
                'id' => $this->profile?->city?->province?->id,
                'name' => $this->profile?->city?->province?->name,
                'slug' => $this->profile?->city?->province?->slug,
            ],

            'expertise' => $this->legalCategories
                ->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ])
                ->values(),

            'avatar' => $this->profile?->avatar?->getUrl(),

            // اطلاعات پروفایل
            'tagline' => $this->vendorProfile?->profile('tagline'),

            'rating' => round((float) ($this->approved_reviews_avg_rate ?? 0), 1),
            'reviewCount' => (int) ($this->approved_reviews_count ?? 0),

            'service' => $this->whenLoaded(
                'vendorServices',
                fn () => $this->vendorServices->isNotEmpty()
                    ? new VendorServiceResource($this->vendorServices->first())
                    : null
            ),
        ];
    }
}
