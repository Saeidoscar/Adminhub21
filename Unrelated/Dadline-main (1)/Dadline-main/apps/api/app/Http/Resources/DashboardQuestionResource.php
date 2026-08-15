<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class DashboardQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->is_private ? null : $this->slug,
            'body' => $this->body,
            'excerpt' => Str::limit(Str::squish(strip_tags($this->body)), 180),
            'isPrivate' => (bool) $this->is_private,
            'status' => $this->status?->value ?? (string) $this->status,
            'statusLabel' => $this->status?->label() ?? 'نامشخص',
            'answersCount' => (int) ($this->approved_answers_count ?? ($this->relationLoaded('answers') ? $this->answers->count() : 0)),
            'createdAt' => $this->created_at?->toIso8601String(),
            'category' => $this->whenLoaded('legalCategory', fn () => $this->legalCategory ? [
                'id' => $this->legalCategory->id,
                'name' => $this->legalCategory->name,
                'slug' => $this->legalCategory->slug,
            ] : null),
            'answers' => DashboardQuestionAnswerResource::collection($this->whenLoaded('answers')),
        ];
    }
}
