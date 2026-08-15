<?php

namespace App\Enums;

enum DodbotPurchaseStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'در انتظار',
            self::Completed => 'تکمیل‌شده',
            self::Failed => 'ناموفق',
        };
    }
}
