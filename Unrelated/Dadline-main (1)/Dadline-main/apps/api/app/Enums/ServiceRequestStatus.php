<?php

namespace App\Enums;

enum ServiceRequestStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Offer = 'offer';
    case Returned = 'returned';
    case Handling = 'handling';
    case Finished = 'finished';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'پیش‌نویس',
            self::Submitted => 'ثبت‌شده',
            self::Offer => 'دارای پیشنهاد',
            self::Returned => 'برگشت‌خورده',
            self::Handling => 'در حال انجام',
            self::Finished => 'پایان‌یافته',
        };
    }
}
