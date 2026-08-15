<?php

namespace App\Enums;

enum ContractEventType: string
{
    case DraftUpdated = 'draft_updated';
    case PaymentCompleted = 'payment_completed';
    case SnapshotCreated = 'snapshot_created';
    case Activated = 'activated';
    case InviteSent = 'invite_sent';
    case Viewed = 'viewed';
    case OtpSent = 'otp_sent';
    case OtpVerified = 'otp_verified';
    case Signed = 'signed';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Expired = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::DraftUpdated => 'ویرایش پیش‌نویس',
            self::PaymentCompleted => 'پرداخت انجام شد',
            self::SnapshotCreated => 'هش قرارداد ثبت شد',
            self::Activated => 'فعال برای امضا',
            self::InviteSent => 'دعوت‌نامه ارسال شد',
            self::Viewed => 'مشاهده شد',
            self::OtpSent => 'کد تایید ارسال شد',
            self::OtpVerified => 'کد تایید شد',
            self::Signed => 'امضا شد',
            self::Completed => 'منعقد شد',
            self::Cancelled => 'لغو شد',
            self::Expired => 'منقضی شد',
        };
    }

    public static function labelFor(?string $type): string
    {
        return self::tryFrom((string) $type)?->label() ?? 'نامشخص';
    }
}
