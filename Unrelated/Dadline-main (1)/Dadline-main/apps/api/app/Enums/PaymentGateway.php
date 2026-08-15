<?php

namespace App\Enums;

enum PaymentGateway: string
{
    case Sep = 'sep';
    case Zibal = 'zibal';
    case SnappPay = 'snapp_pay';

    public function label(): string
    {
        return match ($this) {
            self::Sep => 'SEP',
            self::Zibal => 'Zibal',
            self::SnappPay => 'SnappPay',
        };
    }
}
