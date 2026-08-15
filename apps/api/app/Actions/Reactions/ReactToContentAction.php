<?php

namespace App\Actions\Reactions;

use App\Models\ContentReaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ReactToContentAction
{
    /**
     * @param  Model|string  $reactionable
     */
    public function execute(User $user, Model|string $reactionable, string $type): ContentReaction
    {
        $type = $reactionable instanceof Model ? $reactionable->getMorphClass() : $reactionable;
        $id = $reactionable instanceof Model ? $reactionable->getKey() : $reactionable;

        return DB::transaction(function () use ($user, $type, $id): ContentReaction {
            return ContentReaction::query()->updateOrCreate(
                ['user_id' => $user->id, 'reactionable_type' => $type, 'reactionable_id' => $id],
                ['type' => $type]
            );
        });
    }
}
