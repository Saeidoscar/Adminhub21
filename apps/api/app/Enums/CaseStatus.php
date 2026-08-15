<?php

namespace App\Enums;

enum CaseStatus: string
{
    case Intake = 'intake';
    case Active = 'active';
    case InProgress = 'in_progress';
    case Review = 'review';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Intake => 'Intake',
            self::Active => 'Active',
            self::InProgress => 'In Progress',
            self::Review => 'Review',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
            self::Archived => 'Archived',
        };
    }
}
