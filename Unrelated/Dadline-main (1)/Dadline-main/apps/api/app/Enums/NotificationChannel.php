<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case Database = 'database';
    case Sms = 'sms';
    case Push = 'push';
    case Telegram = 'telegram';
    case Eitaa = 'eitaa';
    case Bale = 'bale';
    case Call = 'call';
    case Email = 'email';

    public function preferenceKey(): ?string
    {
        return match ($this) {
            self::Database => null,
            self::Sms => 'sms_enabled',
            self::Push => 'push_enabled',
            self::Telegram => 'bot_enabled',
            self::Eitaa => 'eitaa_enabled',
            self::Bale => 'bale_enabled',
            self::Email => 'email_enabled',
            self::Call => null,
        };
    }

    public function isExternal(): bool
    {
        return $this !== self::Database;
    }
}
