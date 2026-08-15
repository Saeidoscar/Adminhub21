<?php

namespace App\Enums;

enum ServiceResultStatus: string
{
    case Draft = 'draft';
    case Publish = 'publish';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'پیش‌نویس',
            self::Publish => 'منتشرشده',
        };
    }
}
