<?php

namespace App\Services\Notifications\Channels;

use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Services\Notifications\Contracts\NotificationChannelDriver;
use App\Services\Notifications\Data\ProviderSendResult;
use Illuminate\Support\Facades\Log;

class LogNotificationChannel implements NotificationChannelDriver
{
    public function __construct(
        private readonly NotificationChannel $channel,
        private readonly string $provider
    ) {}

    public function channel(): NotificationChannel
    {
        return $this->channel;
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        Log::info('Notification delivery simulated', [
            'delivery_id' => $delivery->id,
            'channel' => $this->channel->value,
            'provider' => $this->provider,
            'recipient' => $delivery->recipient,
        ]);

        return ProviderSendResult::sent(
            provider: $this->provider,
            messageId: $this->provider.'-'.$delivery->id,
        );
    }
}
