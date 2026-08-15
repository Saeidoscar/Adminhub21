<?php

namespace App\Services\Notifications\Channels;

use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Services\Notifications\Contracts\NotificationChannelDriver;
use App\Services\Notifications\Data\ProviderSendResult;

class DatabaseNotificationChannel implements NotificationChannelDriver
{
    public function channel(): NotificationChannel
    {
        return NotificationChannel::Database;
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        return ProviderSendResult::sent('database', 'notification-'.$delivery->notification_id);
    }
}
