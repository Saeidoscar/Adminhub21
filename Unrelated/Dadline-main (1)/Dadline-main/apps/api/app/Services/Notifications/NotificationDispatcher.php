<?php

namespace App\Services\Notifications;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationDeliveryStatus;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use App\Jobs\Notifications\SendNotificationDeliveryJob;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\NotificationPreference;
use App\Services\Notifications\Data\NotificationDispatchData;
use App\Services\Notifications\Data\RenderedNotification;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class NotificationDispatcher
{
    public function __construct(
        private readonly NotificationTemplateRenderer $renderer
    ) {}

    public function dispatch(NotificationDispatchData $data): Notification
    {
        $channels = $data->channels === []
            ? $this->defaultChannels()
            : $data->channels;

        $rendered = collect($channels)
            ->map(fn (NotificationChannel $channel) => $this->renderer->render($data->templateKey, $channel, $data->context));

        $category = $data->category ?? $rendered->first()?->category ?? NotificationCategory::System;
        $priority = $data->priority ?? $rendered->first()?->priority ?? NotificationPriority::Normal;
        $critical = $data->critical || $category->isCritical() || $rendered->contains(fn (RenderedNotification $item) => $item->critical);
        $dedupeWindow = $data->dedupeWindowMinutes ?? (int) $rendered->max('dedupeWindowMinutes');
        $dedupeKey = $data->dedupeKey ?? $this->makeDedupeKey($data, $dedupeWindow);

        if ($dedupeKey !== null) {
            $existing = Notification::query()
                ->where('dedupe_key', $dedupeKey)
                ->first();

            if ($existing !== null) {
                return $existing;
            }
        }

        return DB::transaction(function () use ($data, $channels, $rendered, $category, $priority, $critical, $dedupeKey): Notification {
            $preference = $data->user?->notificationPreference;
            $databaseRendered = $rendered->firstWhere('channel', NotificationChannel::Database) ?? $rendered->first();

            $notification = Notification::create([
                'user_id' => $data->user?->id,
                'template_key' => $data->templateKey,
                'event_key' => $data->eventKey ?? $data->templateKey,
                'channel' => NotificationChannel::Database,
                'recipient' => $data->recipient ?? $data->user?->mobile ?? $data->user?->email ?? 'system',
                'title' => $databaseRendered?->title,
                'body' => $databaseRendered?->body,
                'payload' => $data->context,
                'category' => $category,
                'priority' => $priority,
                'is_critical' => $critical,
                'dedupe_key' => $dedupeKey,
                'metadata' => $data->metadata,
                'status' => NotificationStatus::Pending,
                'expires_at' => $databaseRendered?->retentionDays === null
                    ? null
                    : now()->addDays($databaseRendered->retentionDays),
            ]);

            foreach ($channels as $channel) {
                $item = $rendered->firstWhere('channel', $channel);

                if (! $item instanceof RenderedNotification) {
                    continue;
                }

                if (! $this->channelAllowed($preference, $data->templateKey, $channel, $critical)) {
                    continue;
                }

                $recipient = $this->recipientFor($data, $channel);

                if ($channel->isExternal() && $recipient === null) {
                    continue;
                }

                $nextRetryAt = $this->quietHoursDelay($preference, $item, $critical);

                $delivery = NotificationDelivery::create([
                    'notification_id' => $notification->id,
                    'user_id' => $data->user?->id,
                    'channel' => $channel,
                    'recipient' => $recipient,
                    'title' => $item->title,
                    'body' => $item->body,
                    'payload' => $item->payload,
                    'provider_payload' => [
                        'patterns' => $item->providerPatterns,
                    ],
                    'status' => NotificationDeliveryStatus::Pending,
                    'max_attempts' => $priority === NotificationPriority::Low ? 2 : 3,
                    'sms_units' => $channel === NotificationChannel::Sms ? random_int(1, 3) : 0,
                    'next_retry_at' => $nextRetryAt,
                ]);

                $job = SendNotificationDeliveryJob::dispatch($delivery->id)
                    ->onQueue($priority->queue())
                    ->afterCommit();

                if ($nextRetryAt !== null) {
                    $job->delay($nextRetryAt);
                }
            }

            return $notification;
        });
    }

    /**
     * @return array<int, NotificationChannel>
     */
    private function defaultChannels(): array
    {
        return [
            NotificationChannel::Database,
            NotificationChannel::Push,
            NotificationChannel::Telegram,
            NotificationChannel::Bale,
            NotificationChannel::Eitaa,
            NotificationChannel::Sms,
            NotificationChannel::Email,
        ];
    }

    private function channelAllowed(?NotificationPreference $preference, string $templateKey, NotificationChannel $channel, bool $critical): bool
    {
        $preferenceKey = $channel->preferenceKey();

        if ($preferenceKey === null) {
            return true;
        }

        if ($critical) {
            return true;
        }

        if ($preference !== null && $preference->{$preferenceKey} === false) {
            return false;
        }

        $channelPreferences = $preference?->channel_preferences ?? [];
        $templatePreference = $channelPreferences[$templateKey][$channel->value] ?? null;

        return $templatePreference !== false;
    }

    private function recipientFor(NotificationDispatchData $data, NotificationChannel $channel): ?string
    {
        if ($channel === NotificationChannel::Database) {
            return $data->user?->id === null ? null : (string) $data->user->id;
        }

        if ($channel === NotificationChannel::Sms || $channel === NotificationChannel::Call) {
            return $data->recipient ?? $data->user?->mobile;
        }

        if ($channel === NotificationChannel::Email) {
            return $data->user?->email ?? $data->recipient;
        }

        $botLink = $data->user?->botLink;

        return match ($channel) {
            NotificationChannel::Telegram => $botLink?->telegram_id === null ? null : (string) $botLink->telegram_id,
            NotificationChannel::Bale => $this->baleAcceptsMobile($data)
                ? $data->recipient ?? ($botLink?->bale_id === null ? null : (string) $botLink->bale_id)
                : ($botLink?->bale_id === null ? null : (string) $botLink->bale_id),
            NotificationChannel::Eitaa => $botLink?->eitaa_id === null ? null : (string) $botLink->eitaa_id,
            NotificationChannel::Push => $botLink?->fcm_token,
            default => $data->recipient,
        };
    }

    private function quietHoursDelay(?NotificationPreference $preference, RenderedNotification $rendered, bool $critical): ?CarbonImmutable
    {
        if ($critical || ! $rendered->quietHoursEnabled) {
            return null;
        }

        if ($preference?->quiet_hours_start === null || $preference->quiet_hours_end === null) {
            return null;
        }

        $timezone = $preference->timezone ?: 'Asia/Tehran';
        $now = CarbonImmutable::now($timezone);
        $start = CarbonImmutable::parse($now->toDateString().' '.$preference->quiet_hours_start, $timezone);
        $end = CarbonImmutable::parse($now->toDateString().' '.$preference->quiet_hours_end, $timezone);

        if ($end->lessThanOrEqualTo($start)) {
            $insideQuietHours = $now->greaterThanOrEqualTo($start) || $now->lessThan($end);
            $resumeAt = $now->lessThan($end) ? $end : $end->addDay();
        } else {
            $insideQuietHours = $now->betweenIncluded($start, $end);
            $resumeAt = $end;
        }

        return $insideQuietHours ? $resumeAt->utc() : null;
    }

    private function makeDedupeKey(NotificationDispatchData $data, int $windowMinutes): ?string
    {
        if ($windowMinutes <= 0) {
            return null;
        }

        $bucket = intdiv(now()->timestamp, $windowMinutes * 60);
        $subject = $data->user?->id ?? $data->recipient ?? 'anonymous';

        return hash('sha256', implode('|', [
            $data->templateKey,
            $data->eventKey ?? $data->templateKey,
            (string) $subject,
            (string) $bucket,
            hash('sha256', json_encode($data->context)),
        ]));
    }

    private function isOtp(NotificationDispatchData $data): bool
    {
        return str_contains($data->templateKey, '.otp')
            || str_contains($data->templateKey, '_otp')
            || str_contains((string) $data->eventKey, '.otp')
            || str_contains((string) $data->eventKey, '_otp');
    }

    private function baleAcceptsMobile(NotificationDispatchData $data): bool
    {
        return $this->isOtp($data)
            || $data->category === NotificationCategory::Marketing
            || str_contains($data->templateKey, 'marketing')
            || str_contains((string) $data->eventKey, 'marketing')
            || str_contains($data->templateKey, 'bulk')
            || str_contains((string) $data->eventKey, 'bulk');
    }
}
