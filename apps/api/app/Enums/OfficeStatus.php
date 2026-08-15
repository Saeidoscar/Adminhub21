<?php

namespace App\Enums;

enum OfficeStatus: string
{
    case Active = 'active';
    case Deprived = 'deprived';
    case Disabled = 'disabled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Deprived => 'Deprived',
            self::Disabled => 'Disabled',
        };
    }
}
