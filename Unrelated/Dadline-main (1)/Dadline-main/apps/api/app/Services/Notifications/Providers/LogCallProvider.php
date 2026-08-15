<?php

namespace App\Services\Notifications\Providers;

use App\Models\NotificationDelivery;
use App\Services\Notifications\Contracts\CallProvider;
use App\Services\Notifications\Data\ProviderSendResult;
use Illuminate\Support\Facades\Log;

class LogCallProvider implements CallProvider
{
    public function __construct(
        private readonly string $provider = 'voice-call-log',
    ) {}

    public function name(): string
    {
        return $this->provider;
    }

    public function supports(NotificationDelivery $delivery): bool
    {
        $templateKey = $delivery->notification?->template_key
            ?? $delivery->notification()->value('template_key');

        $isOtp = is_string($templateKey)
            && str_ends_with($templateKey, '.call')
            && str_contains($templateKey, 'otp');

        return ! $isOtp || app()->environment(['local', 'testing']);
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        Log::info('Call notification delivery simulated', [
            'delivery_id' => $delivery->id,
            'notification_id' => $delivery->notification_id,
            'recipient' => $delivery->recipient,
        ]);

        return ProviderSendResult::sent(
            provider: $this->name(),
            messageId: 'log-call-'.$delivery->id,
        );
    }
}
