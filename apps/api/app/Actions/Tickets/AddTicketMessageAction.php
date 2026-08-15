<?php

namespace App\Actions\Tickets;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AddTicketMessageAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Ticket $ticket, User $user, array $data): \App\Models\TicketMessage
    {
        return DB::transaction(function () use ($ticket, $user, $data): \App\Models\TicketMessage {
            $message = $ticket->messages()->create(array_merge($data, ['user_id' => $user->id]));
            $ticket->update(['last_message_at' => now()]);

            return $message;
        });
    }
}
