<?php

namespace App\Http\Resources;

use App\Enums\ReviewType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rate,
            'review' => $this->review,
            'type' => self::typeLabelFor($this->type),
            'createdAgo' => $this->created_at?->locale('fa')->diffForHumans(),
            $this->mergeWhen(! $request->filled('vendor'), [
                'vendorAvatar' => $this->vendor?->profile?->avatar?->getUrl(),
                'vendorSlug' => $this->vendor?->vendorProfile?->slug,
                'vendorName' => $this->vendor?->full_name,
                'vendorType' => $this->vendor?->vendorProfile?->vendor_type?->value,
            ]),
        ];
    }

    public static function typeLabelFor(?string $type): string
    {
        return ReviewType::tryFrom((string) $type)?->label()
            ?? $type
            ?? 'سایر خدمات';
    }
}
