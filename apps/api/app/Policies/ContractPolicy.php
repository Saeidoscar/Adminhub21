<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\User;

class ContractPolicy
{
    public function viewAny(User $user): bool
    {
        return (bool) ($user->hasRole('admin') || $user->hasRole('super_admin'));
    }

    public function view(User $user, Contract $contract): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin')
            || $user->id === $contract->user_id
            || $user->id === $contract->client_id;
    }

    public function update(User $user, Contract $contract): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin')
            || $user->id === $contract->user_id
            || $user->id === $contract->client_id;
    }
}
