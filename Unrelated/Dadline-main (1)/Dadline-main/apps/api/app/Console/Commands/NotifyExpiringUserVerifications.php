<?php

namespace App\Console\Commands;

use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use App\Models\Notification;
use App\Models\UserVerification;
use Illuminate\Console\Command;

class NotifyExpiringUserVerifications extends Command
{
    private const VERIFICATION_TTL_MONTHS = 3;

    private const EXPIRY_WARNING_DAYS = 14;

    protected $signature = 'user-verifications:notify-expiring';

    protected $description = 'Notify users when identity verification is expired or close to expiry.';

    public function handle(): int
    {
        $notified = 0;

        UserVerification::query()
            ->with('user')
            ->where('verified_level', '>=', 1)
            ->chunkById(200, function ($verifications) use (&$notified): void {
                foreach ($verifications as $verification) {
                    $message = $this->messageFor($verification);

                    if (! $message || ! $verification->user) {
                        continue;
                    }

                    $type = str_contains($message, 'به‌زودی')
                        ? 'verification_expiring'
                        : 'verification_expired';

                    $exists = Notification::query()
                        ->where('user_id', $verification->user_id)
                        ->where('payload->type', $type)
                        ->whereDate('created_at', now()->toDateString())
                        ->exists();

                    if ($exists) {
                        continue;
                    }

                    Notification::query()->create([
                        'user_id' => $verification->user_id,
                        'channel' => NotificationChannel::Push->value,
                        'recipient' => $verification->user->mobile,
                        'payload' => [
                            'type' => $type,
                            'title' => 'تمدید احراز هویت',
                            'message' => $message,
                            'href' => '/pishkhan/profile/verification',
                        ],
                        'status' => NotificationStatus::Pending->value,
                    ]);

                    $notified++;
                }
            }, 'user_id', 'user_id');

        $this->info("Verification expiry notifications queued: {$notified}");

        return self::SUCCESS;
    }

    private function messageFor(UserVerification $verification): ?string
    {
        if ((int) $verification->verified_level >= 1 && $this->isExpired($verification->mobile_verified_at)) {
            return 'اعتبار احراز هویت سطح ۱ به پایان رسیده است. لطفاً احراز هویت را تمدید کنید.';
        }

        if ((int) $verification->verified_level >= 2 && $this->isExpired($verification->national_verified_at)) {
            return 'اعتبار احراز هویت سطح ۲ به پایان رسیده است. لطفاً احراز هویت را تمدید کنید.';
        }

        if ($this->expiresSoon($verification->national_verified_at)) {
            return 'اعتبار احراز هویت سطح ۲ به‌زودی منقضی می‌شود.';
        }

        if ($this->expiresSoon($verification->mobile_verified_at)) {
            return 'اعتبار احراز هویت سطح ۱ به‌زودی منقضی می‌شود.';
        }

        return null;
    }

    private function expiresAt($verifiedAt)
    {
        return $verifiedAt?->copy()->addMonths(self::VERIFICATION_TTL_MONTHS);
    }

    private function isExpired($verifiedAt): bool
    {
        return $verifiedAt === null || $this->expiresAt($verifiedAt)?->isPast();
    }

    private function expiresSoon($verifiedAt): bool
    {
        $expiresAt = $this->expiresAt($verifiedAt);

        return $expiresAt !== null
            && ! $expiresAt->isPast()
            && $expiresAt->lessThanOrEqualTo(now()->addDays(self::EXPIRY_WARNING_DAYS));
    }
}
