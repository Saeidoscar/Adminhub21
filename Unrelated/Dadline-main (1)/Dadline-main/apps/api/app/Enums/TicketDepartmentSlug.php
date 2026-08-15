<?php

namespace App\Enums;

enum TicketDepartmentSlug: string
{
    case Support = 'support';
    case Contracts = 'contracts';
    case Finance = 'finance';
    case Consultations = 'consultations';
    case Legal = 'legal';
    case Judiciary = 'judiciary';
    case Technical = 'technical';
    case Identity = 'identity';
    case Providers = 'providers';
    case Complaints = 'complaints';

    public function label(): string
    {
        return match ($this) {
            self::Support => 'واحد پشتیبانی مشتریان',
            self::Contracts => 'واحد امور قراردادها',
            self::Finance => 'واحد امور مالی',
            self::Consultations => 'واحد امور مشاوره‌ها',
            self::Legal => 'واحد درخواست‌های حقوقی',
            self::Judiciary => 'واحد درخواست‌های قضایی',
            self::Technical => 'واحد پشتیبانی فنی',
            self::Identity => 'واحد احراز هویت و حساب کاربری',
            self::Providers => 'واحد امور وکلا و کارشناسان',
            self::Complaints => 'واحد رسیدگی و شکایات',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $department) => [$department->value => $department->label()])
            ->all();
    }
}
