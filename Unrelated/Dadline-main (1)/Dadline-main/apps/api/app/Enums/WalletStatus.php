<?php

namespace App\Enums;

enum WalletStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'فعال',
            self::Suspended => 'تعلیق‌شده',
            self::Closed => 'بسته‌شده',
        };
    }
}
