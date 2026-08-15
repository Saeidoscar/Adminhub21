<?php

namespace App\Services\Notifications\Providers;

use App\Models\NotificationDelivery;
use App\Services\Notifications\Contracts\SmsProvider;
use App\Services\Notifications\Data\ProviderSendResult;
use Illuminate\Support\Facades\Log;

class LogSmsProvider implements SmsProvider
{
    public function __construct(
        private readonly string $provider = 'log'
    ) {}

    public function name(): string
    {
        return $this->provider;
    }

    public function supports(NotificationDelivery $delivery): bool
    {
        return app()->environment(['local', 'testing']);
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        Log::info('SMS notification delivery simulated', [
            'delivery_id' => $delivery->id,
            'notification_id' => $delivery->notification_id,
            'recipient' => $delivery->recipient,
            'sms_units' => $delivery->sms_units,
        ]);

        return ProviderSendResult::sent(
            provider: $this->name(),
            messageId: 'log-'.$delivery->id,
        );
    }
}
