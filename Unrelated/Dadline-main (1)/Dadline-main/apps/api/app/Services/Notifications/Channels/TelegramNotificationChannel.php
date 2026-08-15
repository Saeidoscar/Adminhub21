<?php

namespace App\Services\Notifications\Channels;

use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Services\Notifications\Contracts\NotificationChannelDriver;
use App\Services\Notifications\Data\ProviderSendResult;
use App\Services\Notifications\TelegramGateway;

class TelegramNotificationChannel implements NotificationChannelDriver
{
    public function __construct(
        private readonly TelegramGateway $gateway,
    ) {}

    public function channel(): NotificationChannel
    {
        return NotificationChannel::Telegram;
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        if (blank($delivery->recipient)) {
            return ProviderSendResult::failed(
                provider: 'telegram-bot-api',
                errorCode: 'missing_recipient',
                errorMessage: 'شناسه گیرنده تلگرام مشخص نیست.',
                retryable: false,
            );
        }

        return $this->gateway->sendToChat(
            chatId: $delivery->recipient,
            text: (string) $delivery->body,
        );
    }
}
