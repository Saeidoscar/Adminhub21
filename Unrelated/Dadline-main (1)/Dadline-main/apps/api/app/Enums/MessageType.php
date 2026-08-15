<?php

namespace App\Enums;

enum MessageType: int
{
    case User = 0;
    case Vendor = 1;
    case Service = 2;

    public function label(): string
    {
        return match ($this) {
            self::User => 'کاربر',
            self::Vendor => 'وندور',
            self::Service => 'سرویس',
        };
    }
}
