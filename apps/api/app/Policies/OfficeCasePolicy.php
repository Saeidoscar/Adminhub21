<?php

namespace App\Policies;

use App\Models\OfficeCase;
use App\Models\User;

class OfficeCasePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }

    public function view(User $user, OfficeCase $case): bool
    {
        return $this->manage($user, $case);
    }

    public function update(User $user, OfficeCase $case): bool
    {
        return $this->manage($user, $case);
    }

    public function delete(User $user, OfficeCase $case): bool
    {
        return $this->manage($user, $case);
    }

    public function manage(User $user, OfficeCase $case): bool
    {
        if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
            return true;
        }

        $office = $case->office;

        if ($office && $office->owner_id === $user->id) {
            return true;
        }

        return (bool) ($office && $office->members()->where('user_id', $user->id)->exists());
    }
}
