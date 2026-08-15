<?php

namespace App\Jobs\Notifications;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationDeliveryStatus;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use App\Models\NotificationDelivery;
use App\Services\Notifications\Data\NotificationDispatchData;
use App\Services\Notifications\NotificationChannelManager;
use App\Services\Notifications\NotificationDispatcher;
use App\Services\Notifications\SmsBalanceService;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class SendNotificationDeliveryJob implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function __construct(
        public int $deliveryId
    ) {}

    public function handle(
        NotificationChannelManager $channels,
        NotificationDispatcher $notifications,
        SmsBalanceService $smsBalance
    ): void {
        $delivery = NotificationDelivery::query()
            ->with('notification')
            ->findOrFail($this->deliveryId);

        if (in_array($delivery->status, [
            NotificationDeliveryStatus::Sent,
            NotificationDeliveryStatus::Cancelled,
        ], true)) {
            return;
        }

        if ($delivery->next_retry_at !== null && $delivery->next_retry_at->isFuture()) {
            $this->release($delivery->next_retry_at->diffInSeconds(now()));

            return;
        }

        $delivery->forceFill([
            'status' => NotificationDeliveryStatus::Sending,
            'attempts' => $delivery->attempts + 1,
        ])->save();

        $smsBalanceReserved = $smsBalance->reserve($delivery);

        if ($delivery->channel === NotificationChannel::Sms && ! $smsBalanceReserved && ! $this->isCritical($delivery)) {
            $delivery->forceFill([
                'status' => NotificationDeliveryStatus::Failed,
                'error_code' => 'insufficient_sms_balance',
                'error_message' => 'User SMS balance is not enough for this delivery.',
                'failed_at' => now(),
            ])->save();

            if ($smsBalance->disableForInsufficientBalance($delivery)) {
                $this->notifyInsufficientSmsBalance($delivery, $notifications);
            }

            return;
        }

        $result = $channels->driver($delivery->channel)->send($delivery);

        if ($result->successful) {
            DB::transaction(function () use ($delivery, $result): void {
                $delivery->forceFill([
                    'provider' => $result->provider,
                    'provider_message_id' => $result->messageId,
                    'provider_payload' => array_merge($delivery->provider_payload ?? [], $result->payload),
                    'status' => NotificationDeliveryStatus::Sent,
                    'sent_at' => now(),
                    'failed_at' => null,
                    'error_code' => null,
                    'error_message' => null,
                ])->save();

                $delivery->notification->forceFill([
                    'status' => NotificationStatus::Sent,
                    'sent_at' => $delivery->notification->sent_at ?? now(),
                ])->save();
            });

            return;
        }

        if ($smsBalanceReserved) {
            $smsBalance->refund($delivery);
        }

        $shouldRetry = $result->retryable && $delivery->attempts < $delivery->max_attempts;

        $delivery->forceFill([
            'provider' => $result->provider,
            'provider_payload' => array_merge($delivery->provider_payload ?? [], $result->payload),
            'status' => $shouldRetry ? NotificationDeliveryStatus::Retrying : NotificationDeliveryStatus::Failed,
            'error_code' => $result->errorCode,
            'error_message' => $result->errorMessage,
            'next_retry_at' => $shouldRetry ? now()->addSeconds($this->backoff()[min($delivery->attempts - 1, 2)]) : null,
            'failed_at' => $shouldRetry ? null : now(),
        ])->save();

        if ($shouldRetry) {
            $this->release($delivery->next_retry_at->diffInSeconds(now()));

            return;
        }

        $hasPendingDeliveries = $delivery->notification
            ->deliveries()
            ->whereIn('status', [
                NotificationDeliveryStatus::Pending->value,
                NotificationDeliveryStatus::Sending->value,
                NotificationDeliveryStatus::Retrying->value,
                NotificationDeliveryStatus::Sent->value,
            ])
            ->exists();

        if (! $hasPendingDeliveries) {
            $delivery->notification->forceFill([
                'status' => NotificationStatus::Failed,
            ])->save();
        }
    }

    private function notifyInsufficientSmsBalance(NotificationDelivery $delivery, NotificationDispatcher $notifications): void
    {
        $user = $delivery->user;

        if ($user === null) {
            return;
        }

        $notifications->dispatch(new NotificationDispatchData(
            user: $user,
            recipient: null,
            templateKey: 'sms.balance.exhausted',
            context: [
                'user_id' => $user->id,
                'mobile' => $user->mobile,
                'required_units' => $delivery->sms_units,
                'message' => 'سهمیه پیامک شما به اتمام رسیده است. برای استفاده مجدد از ارسال پیامک، لطفاً بسته شارژ پیامک تهیه کنید.',
            ],
            channels: [
                NotificationChannel::Database,
                NotificationChannel::Push,
                NotificationChannel::Telegram,
                NotificationChannel::Bale,
                NotificationChannel::Eitaa,
                NotificationChannel::Email,
            ],
            eventKey: 'sms.balance.exhausted',
            category: NotificationCategory::System,
            priority: NotificationPriority::High,
            critical: true,
            dedupeKey: 'sms.balance.exhausted:'.$user->id.':'.now()->toDateString(),
        ));
    }

    private function isCritical(NotificationDelivery $delivery): bool
    {
        return (bool) $delivery->notification?->is_critical;
    }
}
