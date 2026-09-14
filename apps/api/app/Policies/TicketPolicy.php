<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }

    public function view(User $user, Ticket $ticket): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }

    public function update(User $user, Ticket $ticket): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin')
            || $user->id === $ticket->user_id
            || $user->id === $ticket->assigned_to;
    }

    public function manage(User $user, Ticket $ticket): bool
    {
        return $this->update($user, $ticket);
    }
}
