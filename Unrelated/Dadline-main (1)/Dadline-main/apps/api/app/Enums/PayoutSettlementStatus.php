<?php

namespace App\Enums;

enum PayoutSettlementStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
    case Reversed = 'reversed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'در انتظار',
            self::Processing => 'در حال پردازش',
            self::Completed => 'تکمیل‌شده',
            self::Failed => 'ناموفق',
            self::Cancelled => 'لغوشده',
            self::Reversed => 'برگشت‌خورده',
        };
    }
}
