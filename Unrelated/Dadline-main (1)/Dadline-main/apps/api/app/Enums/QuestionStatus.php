<?php

namespace App\Enums;

enum QuestionStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Publish = 'publish';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'در انتظار بررسی',
            self::Approved => 'ثبت‌شده',
            self::Publish => 'منتشرشده',
        };
    }
}
