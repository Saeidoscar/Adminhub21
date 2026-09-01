<?php

namespace App\Notifications\Contracts;

use App\Models\Contract;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContractSignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Contract $contract
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
            ->subject("Contract Signed: #{$this->contract->id}")
            ->greeting("Hello {$notifiable->name},")
            ->line("A contract has been successfully signed.")
            ->line("Contract ID: #{$this->contract->id}")
            ->line("Status: {$this->contract->status->value}")
            ->action('View Contract', url("/contracts/{$this->contract->id}"))
            ->line('Thank you for using AdminHub21!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'contract_id' => $this->contract->id,
            'status' => $this->contract->status->value,
            'type' => 'contract_signed',
        ];
    }
}
