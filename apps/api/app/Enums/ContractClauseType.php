<?php

namespace App\Enums;

enum ContractClauseType: string
{
    case Insurance = 'insurance';
    case Substitute = 'substitute';
    case Termination = 'termination';
    case Liability = 'liability';
    case Confidentiality = 'confidentiality';

    public function label(): string
    {
        return match ($this) {
            self::Insurance => 'Insurance',
            self::Substitute => 'Substitute',
            self::Termination => 'Termination',
            self::Liability => 'Liability',
            self::Confidentiality => 'Confidentiality',
        };
    }

    public static function labelFor(?string $type): string
    {
        return self::tryFrom((string) $type)?->label() ?? 'Unknown';
    }
}
