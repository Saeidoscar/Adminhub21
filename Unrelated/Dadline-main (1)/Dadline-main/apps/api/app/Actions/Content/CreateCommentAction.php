<?php

namespace App\Actions\Content;

use App\Models\Blog;
use App\Models\Comment;
use App\Models\Story;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CreateCommentAction
{
    public function execute(Story|Blog $content, User $user, array $data): Comment
    {
        $parent = null;

        if (filled($data['parent_public_id'] ?? null)) {
            $parent = Comment::query()
                ->where('public_id', $data['parent_public_id'])
                ->firstOrFail();

            $belongsToSameTarget = $content instanceof Story
                ? $parent->story_id === $content->getKey() && $parent->blog_id === null
                : $parent->blog_id === $content->getKey() && $parent->story_id === null;

            if (! $belongsToSameTarget) {
                throw ValidationException::withMessages([
                    'parent_public_id' => 'The parent comment does not belong to this content.',
                ]);
            }
        }

        return Comment::query()->create([
            'story_id' => $content instanceof Story ? $content->getKey() : null,
            'blog_id' => $content instanceof Blog ? $content->getKey() : null,
            'user_id' => $user->getKey(),
            'parent_id' => $parent?->getKey(),
            'content' => $data['content'],
        ])->load('user');
    }
}
