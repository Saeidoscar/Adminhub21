<?php

namespace App\Services\Notifications\Channels;

use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Services\Notifications\Contracts\NotificationChannelDriver;
use App\Services\Notifications\Data\ProviderSendResult;
use App\Services\Notifications\EitaaGateway;

class EitaaNotificationChannel implements NotificationChannelDriver
{
    public function __construct(
        private readonly EitaaGateway $gateway,
    ) {}

    public function channel(): NotificationChannel
    {
        return NotificationChannel::Eitaa;
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        if (blank($delivery->recipient)) {
            return ProviderSendResult::failed(
                provider: 'eitaa-yar',
                errorCode: 'missing_recipient',
                errorMessage: 'شناسه گیرنده ایتا مشخص نیست.',
                retryable: false,
            );
        }

        return $this->gateway->sendToAppChat(
            chatId: $delivery->recipient,
            text: (string) $delivery->body,
        );
    }
}
