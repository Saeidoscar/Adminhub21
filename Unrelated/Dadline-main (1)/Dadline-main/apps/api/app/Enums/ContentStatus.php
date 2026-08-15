<?php

namespace App\Enums;

enum ContentStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case Published = 'published';
    case Rejected = 'rejected';
    case Archived = 'archived';

    public function canTransitionTo(self $status): bool
    {
        return in_array($status, match ($this) {
            self::Draft => [self::Pending],
            self::Pending => [self::Published, self::Rejected],
            self::Published => [self::Archived],
            self::Rejected => [self::Draft],
            self::Archived => [],
        }, true);
    }
}
