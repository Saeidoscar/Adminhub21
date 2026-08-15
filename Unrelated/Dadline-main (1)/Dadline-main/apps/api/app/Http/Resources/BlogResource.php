<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $canSeeWorkflow = $request->user()?->getKey() === $this->user_id
            || $request->user()?->isAdmin() === true;

        return [
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->when($request->routeIs('*.show') || ! $request->isMethod('get'), $this->content),
            'viewsCount' => $this->views_count,
            'likesCount' => $this->likes_count,
            'dislikesCount' => $this->dislikes_count,
            'commentsCount' => $this->whenCounted('comments'),
            'publishedAt' => $this->published_at,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'author' => $this->whenLoaded('author', fn () => [
                'name' => $this->author?->full_name,
            ]),
            'category' => $this->whenLoaded('legalCategory', fn () => $this->legalCategory ? [
                'name' => $this->legalCategory->name,
                'slug' => $this->legalCategory->slug,
            ] : null),
            'featuredImageUrl' => $this->whenLoaded('featuredImage', fn () => $this->featuredImage?->getUrl()),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            $this->mergeWhen($canSeeWorkflow, [
                'status' => $this->status->value,
                'rejectionReason' => $this->rejection_reason,
            ]),
        ];
    }
}
