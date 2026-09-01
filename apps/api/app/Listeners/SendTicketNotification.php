<?php

namespace App\Listeners;

use App\Events\TicketCreated;
use App\Events\TicketReplied;
use App\Jobs\SendNotification;
use App\Models\User;
use App\Notifications\Tickets\TicketCreatedNotification;
use App\Notifications\Tickets\TicketReplyNotification;

class SendTicketNotification
{
    public function handle(TicketCreated|TicketReplied $event): void
    {
        if ($event instanceof TicketCreated) {
            $this->handleTicketCreated($event);
        } elseif ($event instanceof TicketReplied) {
            $this->handleTicketReplied($event);
        }
    }

    private function handleTicketCreated(TicketCreated $event): void
    {
        $admins = User::where('is_admin', true)->get();

        foreach ($admins as $admin) {
            SendNotification::dispatch($admin, new TicketCreatedNotification($event->ticket, $event->creator));
        }
    }

    private function handleTicketReplied(TicketReplied $event): void
    {
        $ticket = $event->ticket;
        $message = $event->message;

        $recipientId = $message->user_id === $ticket->user_id
            ? $ticket->assigned_to
            : $ticket->user_id;

        if ($recipientId) {
            $recipient = User::find($recipientId);
            if ($recipient) {
                SendNotification::dispatch($recipient, new TicketReplyNotification($ticket, $message));
            }
        }
    }
}
