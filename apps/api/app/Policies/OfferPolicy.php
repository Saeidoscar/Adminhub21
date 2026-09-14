<?php

namespace App\Policies;

use App\Models\Offer;
use App\Models\User;

class OfferPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }

    public function view(User $user, Offer $offer): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin')
            || $user->id === $offer->user_id
            || $user->id === $offer->target_user_id;
    }

    public function update(User $user, Offer $offer): bool
    {
        return $this->view($user, $offer);
    }

    public function delete(User $user, Offer $offer): bool
    {
        return $this->view($user, $offer);
    }
}
