<?php

namespace App\Services\Notifications\Contracts;

use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Services\Notifications\Data\ProviderSendResult;

interface NotificationChannelDriver
{
    public function channel(): NotificationChannel;

    public function send(NotificationDelivery $delivery): ProviderSendResult;
}
