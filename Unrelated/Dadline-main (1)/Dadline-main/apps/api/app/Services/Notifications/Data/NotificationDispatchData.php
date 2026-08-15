<?php

namespace App\Services\Notifications\Data;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Models\User;

class NotificationDispatchData
{
    /**
     * @param  array<string, mixed>  $context
     * @param  array<int, NotificationChannel>  $channels
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public readonly ?User $user,
        public readonly ?string $recipient,
        public readonly string $templateKey,
        public readonly array $context = [],
        public readonly array $channels = [],
        public readonly ?string $eventKey = null,
        public readonly ?NotificationCategory $category = null,
        public readonly ?NotificationPriority $priority = null,
        public readonly bool $critical = false,
        public readonly ?string $dedupeKey = null,
        public readonly ?int $dedupeWindowMinutes = null,
        public readonly array $metadata = [],
    ) {}
}
