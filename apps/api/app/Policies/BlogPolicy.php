<?php

namespace App\Policies;

use App\Models\Blog;
use App\Models\User;

class BlogPolicy
{
    public function moderate(User $user, Blog $blog): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }
}
