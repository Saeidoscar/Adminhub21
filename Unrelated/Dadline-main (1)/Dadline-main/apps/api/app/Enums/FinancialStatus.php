<?php

namespace App\Enums;

enum FinancialStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Returned = 'returned';
    case Canceled = 'canceled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'در انتظار',
            self::Accepted => 'تاییدشده',
            self::Returned => 'برگشت‌خورده',
            self::Canceled => 'لغوشده',
        };
    }
}
