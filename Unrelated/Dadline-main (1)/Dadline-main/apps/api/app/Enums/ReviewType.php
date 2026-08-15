<?php

namespace App\Enums;

enum ReviewType: string
{
    case Document = 'doc';
    case Case = 'case';
    case QuestionAnswer = 'q_answer';
    case PhoneConsultation = 'phone';
    case Site = 'site';
    case Vendor = 'vendor';

    public function label(): string
    {
        return match ($this) {
            self::Document => 'تنظیم سند',
            self::Case => 'بررسی پرونده',
            self::QuestionAnswer => 'سوال حقوقی',
            self::PhoneConsultation => 'مشاوره تلفنی',
            self::Site => 'پلتفرم دادلاین',
            self::Vendor => 'دیدگاه وکیل',
        };
    }
}
