<?php

namespace App\Enums;

enum NotificationPriority: string
{
    case Low = 'low';
    case Normal = 'normal';
    case High = 'high';
    case Critical = 'critical';

    public function queue(): string
    {
        return match ($this) {
            self::Critical, self::High => 'notifications-high',
            self::Normal => 'notifications',
            self::Low => 'notifications-low',
        };
    }
}
