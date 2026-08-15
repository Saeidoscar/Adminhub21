<?php

namespace App\Enums;

enum WalletPaymentStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'در انتظار',
            self::Processing => 'در حال پردازش',
            self::Completed => 'تکمیل‌شده',
            self::Failed => 'ناموفق',
            self::Cancelled => 'لغوشده',
        };
    }
}
