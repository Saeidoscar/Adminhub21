<?php

namespace App\Enums;

enum ReviewType: string
{
    case Platform = 'platform';
    case Freelancer = 'freelancer';
    case Contract = 'contract';

    public function label(): string
    {
        return match ($this) {
            self::Platform => 'Platform Review',
            self::Freelancer => 'Freelancer Review',
            self::Contract => 'Contract Review',
        };
    }
}
