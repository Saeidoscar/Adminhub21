<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case Database = 'database';
    case Sms = 'sms';
    case Push = 'push';
    case Email = 'email';
    case Telegram = 'telegram';

    public function preferenceKey(): ?string
    {
        return match ($this) {
            self::Database => null,
            self::Sms => 'sms_enabled',
            self::Push => 'push_enabled',
            self::Email => 'email_enabled',
            self::Telegram => 'telegram_enabled',
        };
    }

    public function isExternal(): bool
    {
        return $this !== self::Database;
    }
}
