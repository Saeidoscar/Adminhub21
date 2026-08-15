<?php

namespace App\Enums;

enum ContractEvidenceReportAudience: string
{
    case User = 'user';
    case Judicial = 'judicial';

    public function label(): string
    {
        return match ($this) {
            self::User => 'کاربر',
            self::Judicial => 'مرجع قضایی',
        };
    }
}
