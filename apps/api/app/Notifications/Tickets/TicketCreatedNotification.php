<?php

namespace App\Notifications\Tickets;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Ticket $ticket,
        private readonly User $creator
    ) {
        $this->onQueue('notifications-default');
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New Ticket: {$this->ticket->subject}")
            ->greeting("Hello {$notifiable->name},")
            ->line("A new support ticket has been created.")
            ->line("Ticket ID: #{$this->ticket->id}")
            ->line("Subject: {$this->ticket->subject}")
            ->line("Priority: {$this->ticket->priority->value}")
            ->line("Created by: {$this->creator->name}")
            ->action('View Ticket', url("/admin/tickets/{$this->ticket->id}"))
            ->line('Thank you for using AdminHub21!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'ticket_id' => $this->ticket->id,
            'subject' => $this->ticket->subject,
            'priority' => $this->ticket->priority->value,
            'created_by' => $this->creator->name,
            'type' => 'ticket_created',
        ];
    }
}
