<?php

namespace App\Enums;

enum VendorType: string
{
    case LAWYER = 'lawyer';
    case EXPERT = 'expert';
    case JUDGE = 'judge';

    public function label(): string
    {
        return match ($this) {
            self::LAWYER => 'وکیل',
            self::EXPERT => 'کارشناس',
            self::JUDGE => 'قاضی',
        };
    }

    public function route(): string
    {
        return match ($this) {
            self::LAWYER => 'lawyer',
            self::EXPERT => 'expert',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn ($item) => [
                $item->value => $item->label(),
            ])
            ->toArray();
    }
}