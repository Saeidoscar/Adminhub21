<?php

namespace App\Actions\Tickets;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use Illuminate\Support\Facades\DB;

class CloseTicketAction
{
    public function execute(Ticket $ticket): Ticket
    {
        return DB::transaction(function () use ($ticket): Ticket {
            $ticket->status = TicketStatus::Closed->value;
            $ticket->resolved_at = now();
            $ticket->save();

            return $ticket;
        });
    }
}
