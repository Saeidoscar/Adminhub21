<?php

namespace App\Enums;

enum DodbotConversationStatus: string
{
    case Active = 'active';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'فعال',
            self::Closed => 'بسته‌شده',
        };
    }
}
