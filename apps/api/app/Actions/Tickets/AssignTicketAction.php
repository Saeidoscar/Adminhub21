<?php

namespace App\Actions\Tickets;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AssignTicketAction
{
    public function execute(Ticket $ticket, User $agent): Ticket
    {
        return DB::transaction(function () use ($ticket, $agent): Ticket {
            $ticket->assigned_to = $agent->id;
            $ticket->save();

            return $ticket->load(['assignedTo']);
        });
    }
}
