<?php

namespace App\Actions\Content;

use App\Enums\ReactionType;
use App\Models\Blog;
use App\Models\ContentReaction;
use App\Models\Story;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReactToContentAction
{
    public function execute(Story|Blog $content, User $user, ReactionType $reaction): array
    {
        return DB::transaction(function () use ($content, $user, $reaction): array {
            $lockedContent = $content->newQuery()
                ->whereKey($content->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $existing = ContentReaction::query()
                ->where('user_id', $user->getKey())
                ->whereMorphedTo('reactionable', $lockedContent)
                ->lockForUpdate()
                ->first();

            $activeReaction = $reaction;

            if ($existing?->type === $reaction) {
                $this->adjustCounter($lockedContent, $reaction, -1);
                $existing->delete();
                $activeReaction = null;
            } elseif ($existing) {
                $this->adjustCounter($lockedContent, $existing->type, -1);
                $this->adjustCounter($lockedContent, $reaction, 1);
                $existing->update(['type' => $reaction]);
            } else {
                $this->adjustCounter($lockedContent, $reaction, 1);
                $lockedContent->reactions()->create([
                    'user_id' => $user->getKey(),
                    'type' => $reaction,
                ]);
            }

            $lockedContent->saveQuietly();

            return [
                'reaction' => $activeReaction?->value,
                'likesCount' => $lockedContent->likes_count,
                'dislikesCount' => $lockedContent->dislikes_count,
            ];
        });
    }

    private function adjustCounter(Story|Blog $content, ReactionType $reaction, int $amount): void
    {
        $column = $reaction->counterColumn();
        $content->{$column} = max(0, (int) $content->{$column} + $amount);
    }
}
