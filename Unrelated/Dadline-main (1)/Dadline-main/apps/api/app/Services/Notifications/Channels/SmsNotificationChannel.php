<?php

namespace App\Services\Notifications\Channels;

use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Services\Notifications\Contracts\NotificationChannelDriver;
use App\Services\Notifications\Contracts\SmsProvider;
use App\Services\Notifications\Data\ProviderSendResult;
use Throwable;

class SmsNotificationChannel implements NotificationChannelDriver
{
    /**
     * @param  array<int, SmsProvider>  $providers
     */
    public function __construct(
        private readonly array $providers
    ) {}

    public function channel(): NotificationChannel
    {
        return NotificationChannel::Sms;
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        $lastResult = null;
        $attempts = [];
        $retryable = false;

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

            $attempts[] = [
                'provider' => $result->provider,
                'successful' => $result->successful,
                'error_code' => $result->errorCode,
                'retryable' => $result->retryable,
            ];

            if ($result->successful) {
                return ProviderSendResult::sent(
                    provider: $result->provider,
                    messageId: $result->messageId,
                    payload: array_merge($result->payload, ['attempts' => $attempts]),
                );
            }

            $lastResult = $result;
            $retryable = $retryable || $result->retryable;
        }

        if ($lastResult === null) {
            return ProviderSendResult::failed(
                provider: 'sms',
                errorCode: 'provider_unavailable',
                errorMessage: 'No SMS provider is configured for this delivery.',
                retryable: false,
            );
        }

        return ProviderSendResult::failed(
            provider: $lastResult->provider,
            errorCode: $lastResult->errorCode,
            errorMessage: $lastResult->errorMessage,
            retryable: $retryable,
            payload: array_merge($lastResult->payload, ['attempts' => $attempts]),
        );
    }
}
