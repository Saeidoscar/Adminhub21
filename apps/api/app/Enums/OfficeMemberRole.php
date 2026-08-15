<?php

namespace App\Enums;

enum OfficeMemberRole: string
{
    case Owner = 'owner';
    case Partner = 'partner';
    case Associate = 'associate';
    case Secretary = 'secretary';

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'Owner',
            self::Partner => 'Partner',
            self::Associate => 'Associate',
            self::Secretary => 'Secretary',
        };
    }
}
