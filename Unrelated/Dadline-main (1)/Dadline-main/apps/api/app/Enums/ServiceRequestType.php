<?php

namespace App\Enums;

enum ServiceRequestType: string
{
    case Case = 'case';
    case Lawlink = 'lawlink';
    case Document = 'document';

    public function label(): string
    {
        return match ($this) {
            self::Case => 'بررسی پرونده',
            self::Lawlink => 'همکاری حقوقی',
            self::Document => 'تنظیم مستند حقوقی',
        };
    }
}
