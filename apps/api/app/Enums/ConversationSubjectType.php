<?php

namespace App\Enums;

enum ConversationSubjectType: string
{
    case Contract = 'contract';
    case Case = 'case';
    case Service = 'service';

    public function label(): string
    {
        return match ($this) {
            self::Contract => 'Contract',
            self::Case => 'Case',
            self::Service => 'Service',
        };
    }
}
