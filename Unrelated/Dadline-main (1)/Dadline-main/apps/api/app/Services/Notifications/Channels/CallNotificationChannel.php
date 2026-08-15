<?php

namespace App\Services\Notifications\Channels;

use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Services\Notifications\Contracts\CallProvider;
use App\Services\Notifications\Contracts\NotificationChannelDriver;
use App\Services\Notifications\Data\ProviderSendResult;
use Throwable;

class CallNotificationChannel implements NotificationChannelDriver
{
    /**
     * @param  array<int, CallProvider>  $providers
     */
    public function __construct(
        private readonly array $providers,
    ) {}

    public function channel(): NotificationChannel
    {
        return NotificationChannel::Call;
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        $lastResult = null;

        foreach ($this->providers as $provider) {
            if (! $provider->supports($delivery)) {
                continue;
            }

            try {
                $result = $provider->send($delivery);
            } catch (Throwable $exception) {
                $result = ProviderSendResult::failed(
                    provider: $provider->name(),
                    errorCode: 'provider_exception',
                    errorMessage: $exception->getMessage(),
                    retryable: true,
                );
            }

            if ($result->successful) {
                return $result;
            }

            $lastResult = $result;

            if (! $result->retryable) {
                break;
            }
        }

        return $lastResult ?? ProviderSendResult::failed(
            provider: 'call',
            errorCode: 'provider_unavailable',
            errorMessage: 'No call provider is configured.',
            retryable: false,
        );
    }
}
