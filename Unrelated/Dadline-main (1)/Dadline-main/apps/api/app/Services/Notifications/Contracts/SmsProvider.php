<?php

namespace App\Services\Notifications\Contracts;

use App\Models\NotificationDelivery;
use App\Services\Notifications\Data\ProviderSendResult;

interface SmsProvider
{
    public function name(): string;

    public function supports(NotificationDelivery $delivery): bool;

    public function send(NotificationDelivery $delivery): ProviderSendResult;
}
