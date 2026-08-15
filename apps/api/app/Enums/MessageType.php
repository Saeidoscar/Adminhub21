<?php

namespace App\Enums;

enum MessageType: int
{
    case User = 0;
    case System = 1;

    public function label(): string
    {
        return match ($this) {
            self::User => 'User',
            self::System => 'System',
        };
    }
}
