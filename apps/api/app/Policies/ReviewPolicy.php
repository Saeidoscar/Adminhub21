<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }

    public function view(User $user, Review $review): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin')
            || $user->id === $review->user_id
            || $user->id === $review->target_user_id;
    }

    public function create(User $user, Contract $contract): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin')
            || $user->id === $contract->client_id;
    }

    public function update(User $user, Review $review): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin')
            || $user->id === $review->user_id;
    }

    public function delete(User $user, Review $review): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin')
            || $user->id === $review->user_id;
    }

    public function recalculate(User $user, User $target): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin')
            || $user->id === $target->id;
    }
}
