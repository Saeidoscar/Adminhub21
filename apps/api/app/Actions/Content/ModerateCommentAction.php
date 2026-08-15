<?php

namespace App\Actions\Content;

use App\Models\Comment;
use Illuminate\Support\Facades\DB;

class ModerateCommentAction
{
    public function execute(Comment $comment, bool $approved): Comment
    {
        return DB::transaction(function () use ($comment, $approved): Comment {
            $comment->status = $approved ? 'approved' : 'rejected';
            $comment->save();

            return $comment;
        });
    }
}
