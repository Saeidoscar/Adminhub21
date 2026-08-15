<?php

namespace App\Actions\Content;

use App\Enums\ContentStatus;
use App\Models\Story;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PublishStoryAction
{
    public function execute(Story $story): Story
    {
        return DB::transaction(function () use ($story): Story {
            $story->status = ContentStatus::Published->value;
            $story->save();

            return $story;
        });
    }
}
