<?php

namespace App\Policies;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, Ticket $ticket): bool
    {
        return $user->role === UserRole::ADMIN
            || (int) $ticket->sender_id === (int) $user->id
            || (int) $ticket->provider_id === (int) $user->id;
    }

    public function reply(User $user, Ticket $ticket): bool
    {
        return $this->view($user, $ticket)
            && ($user->role === UserRole::ADMIN || $ticket->status !== TicketStatus::Closed);
    }

    public function changeStatus(User $user, Ticket $ticket): bool
    {
        return $user->role === UserRole::ADMIN || (int) $ticket->sender_id === (int) $user->id;
    }
}
