<?php

namespace App\Enums;

enum TicketDepartmentSlug: string
{
    case Support = 'support';
    case Contracts = 'contracts';
    case Finance = 'finance';
    case Technical = 'technical';
    case Accounts = 'accounts';
    case General = 'general';

    public function label(): string
    {
        return match ($this) {
            self::Support => 'Customer Support',
            self::Contracts => 'Contracts Department',
            self::Finance => 'Finance Department',
            self::Technical => 'Technical Support',
            self::Accounts => 'Account Verification',
            self::General => 'General Inquiries',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $department) => [
                $department->value => $department->label(),
            ])
            ->all();
    }
}
