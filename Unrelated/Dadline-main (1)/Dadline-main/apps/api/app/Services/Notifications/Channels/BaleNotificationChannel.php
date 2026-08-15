<?php

namespace App\Services\Notifications\Channels;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Services\Notifications\BaleGateway;
use App\Services\Notifications\Contracts\NotificationChannelDriver;
use App\Services\Notifications\Data\ProviderSendResult;

class BaleNotificationChannel implements NotificationChannelDriver
{
    public function __construct(
        private readonly BaleGateway $gateway,
    ) {}

    public function channel(): NotificationChannel
    {
        return NotificationChannel::Bale;
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        if (blank($delivery->recipient)) {
            return ProviderSendResult::failed(
                provider: 'bale-bot-api',
                errorCode: 'missing_recipient',
                errorMessage: 'شناسه گیرنده یا شماره موبایل بله مشخص نیست.',
                retryable: false,
            );
        }

        if (! $this->shouldUseSafir($delivery)) {
            return $this->gateway->sendToChat(
                chatId: $delivery->recipient,
                text: (string) $delivery->body,
            );
        }

        $templateKey = (string) $delivery->notification?->template_key;
        $otp = data_get($delivery->payload, 'code');
        $requestId = $delivery->id === null ? null : 'bale-delivery-'.$delivery->id;

        if (str_contains($templateKey, 'otp') && is_scalar($otp) && ctype_digit((string) $otp)) {
            return $this->gateway->sendOtpToPhone(
                phoneNumber: $delivery->recipient,
                otp: (string) $otp,
                requestId: $requestId,
            );
        }

        return $this->gateway->sendToPhone(
            phoneNumber: $delivery->recipient,
            text: (string) $delivery->body,
            requestId: $requestId,
        );
    }

    private function shouldUseSafir(NotificationDelivery $delivery): bool
    {
        if (! $this->gateway->isPhoneRecipient($delivery->recipient)) {
            return false;
        }

        if ($delivery->exists && ! $delivery->relationLoaded('notification')) {
            $delivery->loadMissing('notification');
        }

        $notification = $delivery->notification;

        if ($notification === null) {
            return true;
        }

        $templateKey = (string) $notification->template_key;
        $eventKey = (string) $notification->event_key;

        return $notification->category === NotificationCategory::Marketing
            || str_contains($templateKey, 'otp')
            || str_contains($eventKey, 'otp')
            || str_contains($templateKey, 'marketing')
            || str_contains($eventKey, 'marketing')
            || str_contains($templateKey, 'bulk')
            || str_contains($eventKey, 'bulk');
    }
}
