<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    public function moderate(User $user, Comment $comment): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }

    public function delete(User $user, Comment $comment): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }
}
