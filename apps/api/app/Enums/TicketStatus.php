<?php

namespace App\Enums;

enum TicketStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Open',
            self::InProgress => 'In Progress',
            self::Resolved => 'Resolved',
            self::Closed => 'Closed',
        };
    }

    public static function labelFor(?string $status): string
    {
        return self::tryFrom((string) $status)?->label() ?? 'Unknown';
    }

    /** Statuses that still need attention. */
    public static function openStatuses(): array
    {
        return [self::Open->value, self::InProgress->value];
    }
}
