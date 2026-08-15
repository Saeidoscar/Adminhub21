<?php

namespace App\Services\Notifications\Data;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;

class RenderedNotification
{
    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $providerPatterns
     */
    public function __construct(
        public readonly string $templateKey,
        public readonly NotificationChannel $channel,
        public readonly ?string $title,
        public readonly string $body,
        public readonly array $payload,
        public readonly NotificationCategory $category,
        public readonly NotificationPriority $priority,
        public readonly bool $critical,
        public readonly bool $quietHoursEnabled,
        public readonly int $dedupeWindowMinutes,
        public readonly ?int $retentionDays,
        public readonly array $providerPatterns,
    ) {}
}
