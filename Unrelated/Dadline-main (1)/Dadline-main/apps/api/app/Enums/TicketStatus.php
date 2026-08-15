<?php

namespace App\Enums;

enum TicketStatus: string
{
    case Open = 'open';
    case Answered = 'answered';
    case Referred = 'referred';
    case Pending = 'pending';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'باز و در انتظار بررسی',
            self::Answered => 'پاسخ داده‌شده و در انتظار کاربر',
            self::Referred => 'ارجاع‌شده',
            self::Pending => 'در انتظار پاسخ پشتیبانی',
            self::Closed => 'بسته‌شده',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $status) => [$status->value => $status->label()])
            ->all();
    }
}
