<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class PublicQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => Str::limit(strip_tags($this->body), 180),
            'body' => $this->when($request->routeIs('questions.show'), $this->body),
            'createdAt' => $this->created_at?->diffForHumans(),
            'answersCount' => (int) ($this->approved_answers_count ?? 0),
            'author' => $this->whenLoaded('user', fn () => [
                'name' => $this->user?->full_name,
            ]),
            'category' => $this->whenLoaded('legalCategory', fn () => $this->legalCategory ? [
                'name' => $this->legalCategory->name,
                'slug' => $this->legalCategory->slug,
            ] : null),
            'latestResponders' => $this->whenLoaded('answers', fn () => $this->answers
                ->pluck('vendor')
                ->filter()
                ->unique('id')
                ->take(3)
                ->map(fn ($vendor) => [
                    'name' => $vendor?->full_name,
                    'slug' => $vendor?->vendorProfile?->slug,
                    'type' => $vendor?->vendorProfile?->vendor_type?->value,
                    'profilePath' => $this->profilePath($vendor),
                    'avatar' => $vendor?->profile?->avatar?->getUrl(),
                ])
                ->values()),
            'answers' => $this->when(
                $request->routeIs('questions.show'),
                fn () => PublicQuestionAnswerResource::collection($this->whenLoaded('answers'))
            ),
        ];
    }

    private function profilePath($vendor): ?string
    {
        $type = $vendor?->vendorProfile?->vendor_type?->value;
        $slug = $vendor?->vendorProfile?->slug;

        return in_array($type, ['lawyer', 'expert'], true) && $slug
            ? "/{$type}/{$slug}"
            : null;
    }
}
