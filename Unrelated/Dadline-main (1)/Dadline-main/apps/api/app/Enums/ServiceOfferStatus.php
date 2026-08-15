<?php

namespace App\Enums;

enum ServiceOfferStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'در انتظار',
            self::Accepted => 'پذیرفته‌شده',
            self::Rejected => 'ردشده',
        };
    }
}
