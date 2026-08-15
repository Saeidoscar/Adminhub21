<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'type' => $this->product_type->value,
            'description' => $this->description,
            'price' => $this->price,
            'salesCount' => $this->sales_count,
            'viewsCount' => $this->views_count,
            'publishedAt' => $this->published_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'vendor' => $this->whenLoaded('vendor', fn (): ?array => $this->vendor ? [
                'name' => $this->vendor->full_name,
                'role' => $this->vendor->role->label(),
                'slug' => $this->vendor->vendorProfile?->slug,
                'type' => $this->vendor->vendorProfile?->vendor_type?->value,
                'avatarUrl' => $this->vendor->profile?->avatar?->getUrl(false),
            ] : null),
            'category' => $this->whenLoaded('legalCategory', fn (): ?array => $this->legalCategory ? [
                'name' => $this->legalCategory->name,
                'slug' => $this->legalCategory->slug,
            ] : null),
        ];
    }
}
