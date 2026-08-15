<?php

namespace App\Services\Notifications;

use App\Enums\NotificationChannel;
use App\Services\Notifications\Contracts\NotificationChannelDriver;
use InvalidArgumentException;

class NotificationChannelManager
{
    /**
     * @param  array<string, NotificationChannelDriver>  $drivers
     */
    public function __construct(
        private readonly array $drivers
    ) {}

    public function driver(NotificationChannel $channel): NotificationChannelDriver
    {
        return $this->drivers[$channel->value]
            ?? throw new InvalidArgumentException("Notification channel [{$channel->value}] is not configured.");
    }
}
