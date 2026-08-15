<?php

namespace App\Services\Notifications;

use App\Enums\NotificationChannel;
use App\Models\NotificationDelivery;
use App\Models\NotificationPreference;
use App\Models\User;

class SmsBalanceService
{
    public function reserve(NotificationDelivery $delivery): bool
    {
        if ($delivery->channel !== NotificationChannel::Sms || $delivery->user_id === null || $delivery->sms_units <= 0) {
            return true;
        }

        NotificationPreference::query()->firstOrCreate(
            ['user_id' => $delivery->user_id],
            ['sms_balance' => 50]
        );

        return NotificationPreference::query()
            ->where('user_id', $delivery->user_id)
            ->where('sms_balance', '>=', $delivery->sms_units)
            ->decrement('sms_balance', $delivery->sms_units) === 1;
    }

    public function refund(NotificationDelivery $delivery): void
    {
        if ($delivery->channel !== NotificationChannel::Sms || $delivery->user_id === null || $delivery->sms_units <= 0) {
            return;
        }

        NotificationPreference::query()
            ->where('user_id', $delivery->user_id)
            ->increment('sms_balance', $delivery->sms_units);
    }

    public function disableForInsufficientBalance(NotificationDelivery $delivery): bool
    {
        if ($delivery->channel !== NotificationChannel::Sms || $delivery->user_id === null) {
            return false;
        }

        return NotificationPreference::query()
            ->where('user_id', $delivery->user_id)
            ->where('sms_enabled', true)
            ->update(['sms_enabled' => false]) === 1;
    }

    public function recharge(User $user, int $units, bool $enableSms = true): NotificationPreference
    {
        $preference = NotificationPreference::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['sms_balance' => 0]
        );

        $preference->increment('sms_balance', $units);

        if ($enableSms) {
            $preference->forceFill([
                'sms_enabled' => true,
            ])->save();
        }

        return $preference->refresh();
    }
}
