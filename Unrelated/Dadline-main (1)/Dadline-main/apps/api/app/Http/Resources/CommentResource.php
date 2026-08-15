<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'publicId' => $this->public_id,
            'content' => $this->content,
            'likesCount' => $this->likes_count,
            'dislikesCount' => $this->dislikes_count,
            'createdAt' => $this->created_at,
            'author' => $this->whenLoaded('user', fn () => [
                'name' => $this->user?->full_name,
            ]),
            'replies' => CommentResource::collection($this->whenLoaded('approvedReplies')),
            $this->mergeWhen($request->is('v1/admin/*'), [
                'status' => $this->status->value,
                'target' => $this->when(
                    $this->relationLoaded('story') || $this->relationLoaded('blog'),
                    fn () => $this->story
                        ? ['type' => 'story', 'slug' => $this->story->slug]
                        : ['type' => 'blog', 'slug' => $this->blog?->slug],
                ),
            ]),
        ];
    }
}
