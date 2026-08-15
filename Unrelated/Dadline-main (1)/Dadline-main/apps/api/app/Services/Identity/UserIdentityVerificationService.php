<?php

namespace App\Services\Identity;

use App\Models\User;
use App\Models\UserVerification;
use App\Services\ExternalServices\IdentityVerificationManager;
use App\Services\Identity\Data\UserVerificationAttempt;
use App\Support\PersianTextNormalizer;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserIdentityVerificationService
{
    private const VERIFICATION_TTL_MONTHS = 3;

    public function __construct(
        private readonly IdentityVerificationManager $providers,
    ) {}

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function verifyLevelOne(
        User $user,
        string $nationalCode,
        int $inquiryCost = 0,
        array $metadata = [],
    ): UserVerificationAttempt {
        $user->loadMissing(['profile', 'verification']);

        if (
            $user->verification?->identity_locked_at !== null
            && filled($user->profile?->national_id)
            && ! hash_equals((string) $user->profile->national_id, $nationalCode)
        ) {
            throw ValidationException::withMessages([
                'nationalId' => ['کد ملی پس از احراز هویت سطح ۲ قابل تغییر نیست.'],
            ]);
        }

        $result = $this->providers->verifyLevelOne(
            nationalCode: $nationalCode,
            mobile: $user->mobile,
            userId: $user->id,
        );

        if (! $result->matched) {
            return new UserVerificationAttempt(
                matched: false,
                message: 'کد ملی واردشده با مالک شماره موبایل مطابقت ندارد.',
                externalResult: $result,
            );
        }

        $verification = DB::transaction(function () use ($inquiryCost, $metadata, $nationalCode, $result, $user): UserVerification {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                ['national_id' => $nationalCode],
            );

            $verification = $user->verification()->firstOrNew(['user_id' => $user->id]);
            $nationalData = $verification->national_data ?? [];

            $verification->forceFill([
                'verified_level' => max((int) $verification->verified_level, 1),
                'mobile_verified' => true,
                'mobile_verified_at' => now(),
                'national_data' => [
                    ...$nationalData,
                    'level_one_verified' => true,
                    'level_one_verified_at' => now()->toISOString(),
                    'national_id' => $nationalCode,
                    'mobile' => $user->mobile,
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
            message: 'کد ملی و موبایل شما با موفقیت تایید شد.',
            externalResult: $result,
            verification: $verification,
        );
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function verifyLevelTwo(
        User $user,
        string $birthDate,
        int $inquiryCost = 0,
        array $metadata = [],
    ): UserVerificationAttempt {
        $user->loadMissing(['profile', 'verification']);

        if (! $this->hasActiveLevelOne($user->verification) || blank($user->profile?->national_id)) {
            throw ValidationException::withMessages([
                'birthDate' => ['ابتدا احراز هویت سطح ۱ را تکمیل یا تمدید کنید.'],
            ]);
        }

        $nationalCode = (string) $user->profile->national_id;
        $result = $this->providers->verifyLevelTwo(
            nationalCode: $nationalCode,
            birthDate: $birthDate,
            userId: $user->id,
        );

        if (! $result->matched) {
            $message = ($result->data['alive'] ?? null) === false
                ? 'براساس پاسخ ثبت احوال، امکان تایید هویت این شخص وجود ندارد.'
                : 'کد ملی و تاریخ تولد واردشده با اطلاعات ثبت احوال مطابقت ندارد.';

            return new UserVerificationAttempt(
                matched: false,
                message: $message,
                externalResult: $result,
            );
        }

        $officialFirstName = PersianTextNormalizer::normalizeName((string) ($result->data['firstName'] ?? ''));
        $officialLastName = PersianTextNormalizer::normalizeName((string) ($result->data['lastName'] ?? ''));

        $verification = DB::transaction(function () use (
            $birthDate,
            $inquiryCost,
            $metadata,
            $nationalCode,
            $officialFirstName,
            $officialLastName,
            $result,
            $user,
        ): UserVerification {
            $user->forceFill([
                'first_name' => $officialFirstName,
                'last_name' => $officialLastName,
            ])->save();

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'national_id' => $nationalCode,
                    'birth_date' => $birthDate,
                ],
            );

            $verification = $user->verification()->firstOrNew(['user_id' => $user->id]);
            $nationalData = $verification->national_data ?? [];
            $lockedAt = $verification->identity_locked_at ?? now();

            $verification->forceFill([
                'verified_level' => max((int) $verification->verified_level, 2),
                'mobile_verified' => true,
                'mobile_verified_at' => $verification->mobile_verified_at ?? now(),
                'national_verified' => true,
                'national_verified_at' => now(),
                'identity_locked_at' => $lockedAt,
                'national_data' => [
                    ...$nationalData,
                    'level_two_verified' => true,
                    'level_two_verified_at' => now()->toISOString(),
                    'identity_locked_at' => $lockedAt->toISOString(),
                    'national_id' => $nationalCode,
                    'birth_date' => $birthDate,
                    'first_name' => $officialFirstName,
                    'last_name' => $officialLastName,
                    'father_name' => PersianTextNormalizer::normalizeName((string) ($result->data['fatherName'] ?? '')) ?: null,
                    'gender' => $result->data['gender'] ?? null,
                    'alive' => $result->data['alive'] ?? null,
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
            message: 'احراز هویت سطح ۲ با موفقیت تایید شد.',
            externalResult: $result,
            verification: $verification,
        );
    }

    private function hasActiveLevelOne(?UserVerification $verification): bool
    {
        return (bool) $verification?->mobile_verified
            && (int) ($verification?->verified_level ?? 0) >= 1
            && $verification?->mobile_verified_at !== null
            && $verification->mobile_verified_at->copy()->addMonths(self::VERIFICATION_TTL_MONTHS)->isFuture();
    }
}
