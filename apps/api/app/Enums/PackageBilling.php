<?php

namespace App\Enums;

enum PackageBilling: string
{
    case Fixed = 'fixed';
    case Hourly = 'hourly';
    case Milestone = 'milestone';
    case Retainer = 'retainer';

    public function label(): string
    {
        return match ($this) {
            self::Fixed => 'Fixed Price',
            self::Hourly => 'Hourly Rate',
            self::Milestone => 'Milestone-based',
            self::Retainer => 'Retainer',
        };
    }
}
