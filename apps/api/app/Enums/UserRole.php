<?php

namespace App\Enums;

enum UserRole: string
{
    case Employer = 'employer';
    case Admin = 'admin';
    case SuperAdmin = 'super_admin';

    public function label(): string
    {
        return match ($this) {
            self::Employer => 'Employer',
            self::Admin => 'Admin',
            self::SuperAdmin => 'Super Admin',
        };
    }

    public function isAdmin(): bool
    {
        return in_array($this, [
            self::Admin,
            self::SuperAdmin,
        ], true);
    }

    public function isSuperAdmin(): bool
    {
        return $this === self::SuperAdmin;
    }

    public function isEmployer(): bool
    {
        return $this === self::Employer;
    }

    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $role) => [
                $role->value => $role->label(),
            ])
            ->all();
    }
}
