<?php

namespace App\Enums;

enum VendorService: string
{
    case SUBSCRIPTION = 'subscription';
    case CALL = 'call';
    case OFFICE = 'office';
    case CASE = 'case';
    case DOCUMENT = 'document';
    case LAWSUIT = 'lawsuit';
    case REVIEW = 'review';
    case VIDEO = 'video';
    case CHAT = 'chat';
    case LAWLINK = 'lawlink';

    public function label(): string
    {
        return match ($this) {
            self::SUBSCRIPTION => 'اشتراک مشاوره',
            self::CALL => 'مشاوره تلفنی',
            self::OFFICE => 'رزرو دفتر',
            self::CASE => 'بررسی پرونده',
            self::DOCUMENT => 'تنظیم اوراق قضایی',
            self::LAWSUIT => 'پذیرش وکالت',
            self::REVIEW => 'بررسی قرارداد',
            self::VIDEO => 'مشاوره تصویری',
            self::CHAT => 'مشاوره متنی',
            self::LAWLINK => 'همکاری وکالت',
        };
    }

    public static function titleOf(?string $service): ?string
    {
        return self::tryFrom($service)?->label();
    }
}