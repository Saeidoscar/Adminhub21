<?php

namespace App\Enums;

enum NotificationDeliveryStatus: string
{
    case Pending = 'pending';
    case Sending = 'sending';
    case Sent = 'sent';
    case Failed = 'failed';
    case Retrying = 'retrying';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'در انتظار',
            self::Sending => 'در حال ارسال',
            self::Sent => 'ارسال‌شده',
            self::Failed => 'ناموفق',
            self::Retrying => 'در صف تلاش مجدد',
            self::Cancelled => 'لغوشده',
        };
    }
}
