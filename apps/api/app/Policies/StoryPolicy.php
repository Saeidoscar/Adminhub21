<?php

namespace App\Policies;

use App\Models\Story;
use App\Models\User;

class StoryPolicy
{
    public function moderate(User $user, Story $story): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }
}
