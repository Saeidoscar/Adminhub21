<?php

namespace App\Enums;

enum PackageType: string
{
    case Platform = 'platform';
    case Bundle = 'bundle';

    public function label(): string
    {
        return match ($this) {
            self::Platform => 'Platform Package',
            self::Bundle => 'Bundle Package',
        };
    }
}
