<?php

namespace App\Enums;

enum SignatureStatus: string
{
    case Pending = 'pending';
    case Signed = 'signed';
    case Removed = 'removed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'در انتظار امضا',
            self::Signed => 'امضا شده',
            self::Removed => 'حذف شده',
        };
    }

    public static function labelFor(?string $status): string
    {
        return self::tryFrom((string) $status)?->label() ?? 'نامشخص';
    }
}
