<?php

namespace App\Notifications\Tickets;

use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketReplyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Ticket $ticket,
        private readonly TicketMessage $message
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
            ->subject("Re: {$this->ticket->subject}")
            ->greeting("Hello {$notifiable->name},")
            ->line("A new reply has been added to ticket #{$this->ticket->id}.")
            ->line("Subject: {$this->ticket->subject}")
            ->line('Message:')
            ->line($this->message->body)
            ->action('View Ticket', url("/admin/tickets/{$this->ticket->id}"))
            ->line('Thank you for using AdminHub21!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'ticket_id' => $this->ticket->id,
            'message_id' => $this->message->id,
            'subject' => $this->ticket->subject,
            'type' => 'ticket_reply',
        ];
    }
}
