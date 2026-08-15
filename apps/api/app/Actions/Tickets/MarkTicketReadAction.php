<?php

namespace App\Actions\Tickets;

use App\Models\Ticket;
use App\Models\User;

class MarkTicketReadAction
{
    public function execute(Ticket $ticket, User $user): Ticket
    {
        $ticket->markReadBy($user);

        return $ticket;
    }
}
