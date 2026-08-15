<?php

namespace App\Enums;

enum PaymentGateway: string
{
    case Zibal = 'zibal';
    case Sep = 'sep';
    case Crypto = 'crypto';

    public function label(): string
    {
        return match ($this) {
            self::Zibal => 'Zibal',
            self::Sep => 'SEP',
            self::Crypto => 'Crypto',
        };
    }
}
