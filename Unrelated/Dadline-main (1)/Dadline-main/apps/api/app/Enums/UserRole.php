<?php

namespace App\Enums;

enum UserRole: string
{
    case USER = 'user';

    case LAWYER_BONYAD = 'lawyer_bonyad';
    case LAWYER_JUDICIAL = 'lawyer_judicial';
    case LAWYER_TRAINEE = 'lawyer_trainee';

    case JUDGE = 'judge';

    case OFFICIAL_EXPERT = 'official_expert';
    case LEGAL_EXPERT = 'legal_expert';
    case SENIOR_LEGAL_EXPERT = 'senior_legal_expert';
    case LEGAL_DOCTORATE = 'legal_doctorate';

    case ADMIN = 'admin';
    case MANAGER = 'manager';
    case EDITOR = 'editor';

    public function label(): string
    {
        return match ($this) {
            self::USER => 'کاربر محترم دادلاین',

            self::LAWYER_BONYAD => 'وکیل پایه یک کانون وکلای دادگستری',
            self::LAWYER_JUDICIAL => 'وکیل پایه یک مرکز وکلای قوه قضائیه',
            self::LAWYER_TRAINEE => 'کارآموز وکالت',

            self::JUDGE => 'قاضی',

            self::OFFICIAL_EXPERT => 'کارشناس رسمی دادگستری',
            self::LEGAL_EXPERT => 'کارشناس حقوقی',
            self::SENIOR_LEGAL_EXPERT => 'کارشناس ارشد حقوقی',
            self::LEGAL_DOCTORATE => 'دکترای حقوق',

            self::ADMIN => 'مدیر سیستم',
            self::MANAGER => 'مدیر',
            self::EDITOR => 'ویرایشگر',
        };
    }

    public function isLawyer(): bool
    {
        return in_array($this, [
            self::LAWYER_BONYAD,
            self::LAWYER_JUDICIAL,
            self::LAWYER_TRAINEE,
        ], true);
    }

    public function isExpert(): bool
    {
        return in_array($this, [
            self::OFFICIAL_EXPERT,
            self::LEGAL_EXPERT,
            self::SENIOR_LEGAL_EXPERT,
            self::LEGAL_DOCTORATE,
        ], true);
    }

    public function isJudge(): bool
    {
        return $this === self::JUDGE;
    }

    public function isAdmin(): bool
    {
        return in_array($this, [
            self::ADMIN,
            self::MANAGER,
            self::EDITOR,
        ], true);
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