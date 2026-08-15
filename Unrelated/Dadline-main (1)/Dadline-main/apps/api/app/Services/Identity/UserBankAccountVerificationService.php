<?php

namespace App\Services\Identity;

use App\Models\User;
use App\Models\UserVerification;
use App\Services\ExternalServices\BankAccountVerificationManager;
use App\Services\Identity\Data\UserVerificationAttempt;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserBankAccountVerificationService
{
    private const VERIFICATION_TTL_MONTHS = 3;

    public function __construct(
        private readonly BankAccountVerificationManager $providers,
    ) {}

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function verifyAndStore(
        User $user,
        string $iban,
        int $inquiryCost = 0,
        array $metadata = [],
    ): UserVerificationAttempt {
        $user->loadMissing(['profile', 'verification']);

        if (! $this->hasActiveLevelTwo($user->verification)) {
            throw ValidationException::withMessages([
                'iban' => ['برای ثبت شماره شبا، ابتدا احراز هویت سطح ۲ را تکمیل کنید.'],
            ]);
        }

        $nationalCode = trim((string) $user->profile?->national_id);
        $birthDate = trim((string) $user->profile?->birth_date);

        if ($nationalCode === '' || $birthDate === '') {
            throw ValidationException::withMessages([
                'iban' => ['اطلاعات هویتی لازم برای تطبیق شماره شبا کامل نیست.'],
            ]);
        }

        $normalizedIban = strtoupper((string) preg_replace('/\s+/', '', $iban));
        $result = $this->providers->verifyIbanOwnership(
            nationalCode: $nationalCode,
            birthDate: $birthDate,
            iban: $normalizedIban,
            userId: $user->id,
        );

        if (! $result->matched) {
            return new UserVerificationAttempt(
                matched: false,
                message: 'شماره شبا واردشده متعلق به صاحب کد ملی حساب کاربری نیست.',
                externalResult: $result,
            );
        }

        $verification = DB::transaction(function () use ($inquiryCost, $metadata, $normalizedIban, $result, $user): UserVerification {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                ['iban' => $normalizedIban],
            );

            $verification = $user->verification()->firstOrNew(['user_id' => $user->id]);
            $verifiedAt = now();
            $verification->forceFill([
                'iban_verified_at' => $verifiedAt,
                'iban_data' => [
                    'iban' => $normalizedIban,
                    'verified_at' => $verifiedAt->toISOString(),
                    'inquiry_cost' => $inquiryCost,
                    'provider' => $result->provider,
                    'provider_service' => $result->service,
                    'provider_code' => $result->code,
                    'provider_message' => $result->message,
                    'external_request_id' => $result->requestId,
                    'external_request_uuid' => $result->requestUuid,
                    ...$metadata,
                ],
            ])->save();

            return $verification->refresh();
        });

        return new UserVerificationAttempt(
            matched: true,
            message: 'شماره شبا ثبت شد و مالکیت آن با کد ملی شما تطبیق داده شد.',
            externalResult: $result,
            verification: $verification,
        );
    }

    private function hasActiveLevelTwo(?UserVerification $verification): bool
    {
        return (bool) $verification?->mobile_verified
            && (bool) $verification?->national_verified
            && (int) ($verification?->verified_level ?? 0) >= 2
            && $verification?->mobile_verified_at !== null
            && $verification?->national_verified_at !== null
            && $verification->mobile_verified_at->copy()->addMonths(self::VERIFICATION_TTL_MONTHS)->isFuture()
            && $verification->national_verified_at->copy()->addMonths(self::VERIFICATION_TTL_MONTHS)->isFuture();
    }
}
