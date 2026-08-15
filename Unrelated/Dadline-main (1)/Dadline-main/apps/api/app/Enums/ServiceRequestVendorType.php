<?php

namespace App\Enums;

enum ServiceRequestVendorType: string
{
    case All = 'all';
    case Lawyer = 'lawyer';
    case Expert = 'expert';
    case Judge = 'judge';

    public function label(): string
    {
        return match ($this) {
            self::All => 'همه متخصصان',
            self::Lawyer => 'وکیل',
            self::Expert => 'کارشناس',
            self::Judge => 'قاضی',
        };
    }
}
