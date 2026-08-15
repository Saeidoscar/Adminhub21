<?php

namespace App\Actions\Content;

use App\Enums\ContentStatus;
use App\Models\Story;
use Illuminate\Support\Facades\DB;

class UnpublishStoryAction
{
    public function execute(Story $story): Story
    {
        return DB::transaction(function () use ($story): Story {
            $story->status = ContentStatus::Draft->value;
            $story->save();

            return $story;
        });
    }
}
