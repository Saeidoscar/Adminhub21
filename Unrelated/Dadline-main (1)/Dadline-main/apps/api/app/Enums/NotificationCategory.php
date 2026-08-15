<?php

namespace App\Enums;

enum NotificationCategory: string
{
    case Auth = 'auth';
    case Contract = 'contract';
    case Payment = 'payment';
    case Security = 'security';
    case LegalDeadline = 'legal_deadline';
    case System = 'system';
    case Marketing = 'marketing';

    public function isCritical(): bool
    {
        return match ($this) {
            self::Auth,
            self::Contract,
            self::Payment,
            self::Security,
            self::LegalDeadline => true,
            self::System,
            self::Marketing => false,
        };
    }
}
