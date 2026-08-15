<?php

namespace App\Actions\Tickets;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateTicketAction
{
    public function execute(User $sender, array $data): Ticket
    {
        return DB::transaction(function () use ($sender, $data): Ticket {
            $ticket = new Ticket($data);
            $ticket->user_id = $sender->id;
            $ticket->status = TicketStatus::Open->value;
            $ticket->priority = TicketPriority::Normal->value;
            $ticket->save();

            return $ticket->load(['user', 'assignedTo', 'messages']);
        });
    }
}
