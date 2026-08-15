<?php

namespace App\Enums;

enum NotificationCategory: string
{
    case Auth = 'auth';
    case Contract = 'contract';
    case Payment = 'payment';
    case Security = 'security';
    case System = 'system';
    case Marketing = 'marketing';

    public function label(): string
    {
        return match ($this) {
            self::Auth => 'Authentication',
            self::Contract => 'Contracts',
            self::Payment => 'Payments',
            self::Security => 'Security',
            self::System => 'System',
            self::Marketing => 'Marketing',
        };
    }
}
