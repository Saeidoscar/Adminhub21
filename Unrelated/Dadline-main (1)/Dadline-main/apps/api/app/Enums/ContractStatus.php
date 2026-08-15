<?php

namespace App\Enums;

enum ContractStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Completed = 'completed';
    case Expired = 'expired';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'پیش‌نویس',
            self::Active => 'فعال برای امضا',
            self::Completed => 'منعقد شده',
            self::Expired => 'منقضی شده',
            self::Cancelled => 'لغو شده',
        };
    }

    public static function labelFor(?string $status): string
    {
        return self::tryFrom((string) $status)?->label() ?? 'نامشخص';
    }
}
