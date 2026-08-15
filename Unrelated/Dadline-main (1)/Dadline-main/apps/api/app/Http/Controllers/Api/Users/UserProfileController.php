<?php

namespace App\Http\Controllers\Api\Users;

use App\Enums\PaymentGateway;
use App\Enums\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Users\UpdateUserBankAccountRequest;
use App\Http\Requests\Users\UpdateUserProfileRequest;
use App\Http\Requests\Users\UploadUserAvatarRequest;
use App\Models\Attachment;
use App\Models\Option;
use App\Models\User;
use App\Services\Identity\Data\UserVerificationAttempt;
use App\Services\Identity\UserBankAccountVerificationService;
use App\Services\Purchases\PurchasePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserProfileController extends Controller
{
    private const VERIFICATION_TTL_MONTHS = 3;

    public function show(): JsonResponse
    {
        $user = request()->user()->loadMissing([
            'profile.avatar',
            'profile.signature',
            'profile.city.parent',
            'verification',
            'wallet',
            'subscription',
            'notificationPreference',
        ]);

        return response()->json([
            'data' => $this->profilePayload($user),
        ]);
    }

    public function update(UpdateUserProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing(['profile', 'verification']);
        $validated = $request->validated();
        $identityLocked = $user->verification?->identity_locked_at !== null;

        if ($identityLocked) {
            $this->assertLockedIdentityUnchanged($user, $validated);
        }

        DB::transaction(function () use ($identityLocked, $user, $validated): void {
            $profile = $user->profile;

            $user->forceFill([
                'first_name' => $identityLocked ? $user->first_name : $validated['first_name'],
                'last_name' => $identityLocked ? $user->last_name : $validated['last_name'],
                'email' => $validated['email'] ?? null,
            ])->save();

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'national_id' => $identityLocked ? $profile?->national_id : ($validated['national_id'] ?? null),
                    'birth_date' => $identityLocked ? $profile?->birth_date : ($validated['birth_date'] ?? null),
                    'city_id' => $validated['city_id'] ?? null,
                ]
            );
        });

        $user->loadMissing([
            'profile.avatar',
            'profile.signature',
            'profile.city.parent',
            'verification',
            'wallet',
            'subscription',
            'notificationPreference',
        ]);

        return response()->json([
            'message' => 'اطلاعات پروفایل با موفقیت ذخیره شد.',
            'data' => $this->profilePayload($user->fresh([
                'profile.avatar',
                'profile.signature',
                'profile.city.parent',
                'verification',
                'wallet',
                'subscription',
                'notificationPreference',
            ])),
        ]);
    }

    public function avatar(UploadUserAvatarRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);
        $previousAttachment = $profile->avatar_id
            ? Attachment::query()
                ->whereKey($profile->avatar_id)
                ->where('user_id', $user->id)
                ->first()
            : null;

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $storageKey = sprintf(
            'users/%d/avatars/%s.%s',
            $user->id,
            (string) Str::uuid(),
            $extension
        );

        Storage::disk('s3')->put($storageKey, $file->getContent(), [
            'visibility' => 'public',
        ]);

        try {
            $attachment = DB::transaction(function () use ($file, $profile, $storageKey, $user): Attachment {
                $attachment = Attachment::query()->create([
                    'user_id' => $user->id,
                    'storage_key' => $storageKey,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'size_bytes' => $file->getSize(),
                    'is_private' => false,
                    'created_at' => now(),
                ]);

                $profile->forceFill(['avatar_id' => $attachment->id])->save();

                return $attachment;
            });
        } catch (\Throwable $exception) {
            Storage::disk('s3')->delete($storageKey);

            throw $exception;
        }

        $this->deletePreviousAvatar($previousAttachment);

        return response()->json([
            'message' => 'تصویر پروفایل با موفقیت بارگذاری شد.',
            'data' => [
                'avatarId' => $attachment->id,
                'avatarUrl' => $attachment->getUrl(false),
                'originalName' => $attachment->original_name,
                'mimeType' => $attachment->mime_type,
                'sizeBytes' => $attachment->size_bytes,
            ],
        ], 201);
    }

    public function bankAccount(
        UpdateUserBankAccountRequest $request,
        UserBankAccountVerificationService $verificationService,
        PurchasePaymentService $payments,
    ): JsonResponse {
        $user = $request->user()->loadMissing(['profile', 'verification', 'wallet']);
        $validated = $request->validated();
        $iban = (string) $validated['iban'];

        if ($this->activeVerifiedLevel($user->verification) < 2) {
            throw ValidationException::withMessages([
                'iban' => ['برای ثبت شماره شبا، ابتدا احراز هویت فعال سطح ۲ را تکمیل کنید.'],
            ]);
        }

        if (blank($user->profile?->national_id) || blank($user->profile?->birth_date)) {
            throw ValidationException::withMessages([
                'iban' => ['اطلاعات هویتی لازم برای تطبیق شماره شبا کامل نیست.'],
            ]);
        }

        $amount = $this->ibanVerificationCost();
        $payment = null;

        if ($amount <= 0) {
            $attempt = $verificationService->verifyAndStore($user, $iban);
            $this->assertAttemptMatched($attempt, 'iban');
            $message = $attempt->message;
        } else {
            $result = $payments->start(
                user: $user,
                purchaseType: 'user_bank_account_verification',
                purchasableId: $user->id,
                amount: $amount,
                walletType: WalletTransactionType::VerifyCost,
                payload: [
                    'iban' => $iban,
                    'nationalCode' => $user->profile?->national_id,
                    'mobile' => $user->mobile,
                    'description' => 'هزینه استعلام و تطبیق شماره شبا',
                    'return_url' => $validated['return_url'] ?? null,
                    'return_context' => $validated['return_context'] ?? 'user_bank_account_verification',
                ],
                preferredGateway: $this->gateway($validated['gateway'] ?? null),
            );

            if ($result['resource'] instanceof UserVerificationAttempt) {
                $this->assertAttemptMatched($result['resource'], 'iban');
            }

            $message = $result['requires_gateway']
                ? 'برای استعلام و ثبت شماره شبا، پرداخت را انجام دهید.'
                : ($result['resource']?->message ?? 'شماره شبا با موفقیت تایید شد.');
            $payment = $this->paymentPayload($result);
        }

        $user = $user->fresh(['profile', 'verification', 'wallet']);

        return response()->json([
            'message' => $message,
            'data' => [
                'iban' => $user->profile?->iban,
                'ibanVerified' => $user->verification?->iban_verified_at !== null,
                'ibanVerifiedAt' => $user->verification?->iban_verified_at?->toISOString(),
                'payment' => $payment,
            ],
        ]);
    }

    private function profilePayload(User $user): array
    {
        $profile = $user->profile;
        $verification = $user->verification;
        $activeVerifiedLevel = $this->activeVerifiedLevel($verification);

        return [
            'user' => [
                'id' => $user->id,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'fullName' => $user->full_name,
                'mobile' => $user->mobile,
                'email' => $user->email,
                'role' => $user->role->value,
                'roleLabel' => $user->role_label,
                'isVendor' => $user->is_vendor,
                'registeredAt' => $user->registered_at?->toISOString(),
                'lastLoginAt' => $user->last_login_at?->toISOString(),
            ],
            'profile' => [
                'nationalId' => $profile?->national_id,
                'birthDate' => $profile?->birth_date,
                'iban' => $profile?->iban,
                'cityId' => $profile?->city_id,
                'cityName' => $profile?->city?->name,
                'provinceName' => $profile?->city?->parent?->name,
                'avatarId' => $profile?->avatar_id,
                'avatarUrl' => $profile?->avatar?->getUrl(false),
                'signatureId' => $profile?->signature_id,
                'signatureUrl' => $profile?->signature?->getUrl(false),
            ],
            'verification' => [
                'verifiedLevel' => (int) ($verification?->verified_level ?? 0),
                'activeVerifiedLevel' => $activeVerifiedLevel,
                'mobileVerified' => (bool) ($verification?->mobile_verified ?? false),
                'mobileVerifiedAt' => $verification?->mobile_verified_at?->toISOString(),
                'mobileExpiresAt' => $this->expiresAt($verification?->mobile_verified_at)?->toISOString(),
                'mobileExpired' => $this->isExpired($verification?->mobile_verified_at),
                'nationalVerified' => (bool) ($verification?->national_verified ?? false),
                'nationalVerifiedAt' => $verification?->national_verified_at?->toISOString(),
                'nationalExpiresAt' => $this->expiresAt($verification?->national_verified_at)?->toISOString(),
                'nationalExpired' => $this->isExpired($verification?->national_verified_at),
                'identityLocked' => $verification?->identity_locked_at !== null,
                'identityLockedAt' => $verification?->identity_locked_at?->toISOString(),
                'needsRenewal' => ((int) ($verification?->verified_level ?? 0) >= 1 && $this->isExpired($verification?->mobile_verified_at))
                    || ((int) ($verification?->verified_level ?? 0) >= 2 && $this->isExpired($verification?->national_verified_at)),
                'ibanVerified' => $verification?->iban_verified_at !== null,
                'ibanVerifiedAt' => $verification?->iban_verified_at?->toISOString(),
                'bankVerified' => $activeVerifiedLevel >= 3,
                'bankVerifiedAt' => $verification?->bank_verified_at?->toISOString(),
            ],
            'pricing' => [
                'ibanVerificationCost' => $this->ibanVerificationCost(),
                'currency' => 'IRT',
                'currencyLabel' => 'تومان',
            ],
            'wallet' => [
                'balance' => (int) ($user->wallet?->balance ?? 0),
                'withdrawableBalance' => (int) ($user->wallet?->withdrawable_balance ?? 0),
                'blockedBalance' => (int) ($user->wallet?->blocked_balance ?? 0),
                'status' => $user->wallet?->status?->value,
            ],
            'subscription' => [
                'plan' => $user->subscription?->plan?->value,
                'expiresAt' => $user->subscription?->expires_at?->toISOString(),
            ],
            'notificationPreferences' => [
                'smsEnabled' => (bool) ($user->notificationPreference?->sms_enabled ?? true),
                'botEnabled' => (bool) ($user->notificationPreference?->bot_enabled ?? true),
                'pushEnabled' => (bool) ($user->notificationPreference?->push_enabled ?? true),
                'eitaaEnabled' => (bool) ($user->notificationPreference?->eitaa_enabled ?? true),
                'baleEnabled' => (bool) ($user->notificationPreference?->bale_enabled ?? true),
                'smsBalance' => (int) ($user->notificationPreference?->sms_balance ?? 50),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function assertLockedIdentityUnchanged(User $user, array $validated): void
    {
        $profile = $user->profile;
        $errors = [];

        if ($validated['first_name'] !== $user->first_name) {
            $errors['firstName'] = ['نام پس از احراز هویت سطح ۲ قابل ویرایش نیست.'];
        }

        if ($validated['last_name'] !== $user->last_name) {
            $errors['lastName'] = ['نام خانوادگی پس از احراز هویت سطح ۲ قابل ویرایش نیست.'];
        }

        if (($validated['national_id'] ?? null) !== $profile?->national_id) {
            $errors['nationalId'] = ['کد ملی پس از احراز هویت سطح ۲ قابل ویرایش نیست.'];
        }

        if (($validated['birth_date'] ?? null) !== $profile?->birth_date) {
            $errors['birthDate'] = ['تاریخ تولد پس از احراز هویت سطح ۲ قابل ویرایش نیست.'];
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function assertAttemptMatched(UserVerificationAttempt $attempt, string $field): void
    {
        if ($attempt->matched) {
            return;
        }

        throw ValidationException::withMessages([
            $field => [$attempt->message],
        ]);
    }

    private function ibanVerificationCost(): int
    {
        $value = Option::get('verify_iban_cost', 0);

        return is_numeric($value) ? max(0, (int) $value) : 0;
    }

    private function gateway(?string $gateway): ?PaymentGateway
    {
        return match ($gateway) {
            PaymentGateway::Sep->value => PaymentGateway::Sep,
            PaymentGateway::Zibal->value => PaymentGateway::Zibal,
            PaymentGateway::SnappPay->value => PaymentGateway::SnappPay,
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $result
     * @return array<string, mixed>
     */
    private function paymentPayload(array $result): array
    {
        return [
            'status' => $result['intent']->status->value,
            'requiresGateway' => $result['requires_gateway'],
            'paymentUrl' => $result['payment_url'],
            'purchaseIntentId' => $result['intent']->id,
            'purchaseIntentUuid' => $result['intent']->uuid,
            'paymentId' => $result['payment']?->id,
            'gateway' => $result['payment']?->gateway,
            'gatewayToken' => $result['payment']?->gateway_token,
        ];
    }

    private function deletePreviousAvatar(?Attachment $attachment): void
    {
        if (! $attachment) {
            return;
        }

        Storage::disk('s3')->delete($attachment->storage_key);
        $attachment->delete();
    }

    private function activeVerifiedLevel($verification): int
    {
        $levelTwoActive = (bool) ($verification?->mobile_verified ?? false)
            && (bool) ($verification?->national_verified ?? false)
            && (int) ($verification?->verified_level ?? 0) >= 2
            && ! $this->isExpired($verification?->mobile_verified_at)
            && ! $this->isExpired($verification?->national_verified_at);

        if (
            $levelTwoActive
            && (bool) ($verification?->bank_verified ?? false)
            && (int) ($verification?->verified_level ?? 0) >= 3
            && $verification?->bank_verified_at !== null
        ) {
            return 3;
        }

        if ($levelTwoActive) {
            return 2;
        }

        if (
            (bool) ($verification?->mobile_verified ?? false)
            && (int) ($verification?->verified_level ?? 0) >= 1
            && ! $this->isExpired($verification?->mobile_verified_at)
        ) {
            return 1;
        }

        return 0;
    }

    private function expiresAt($verifiedAt)
    {
        return $verifiedAt?->copy()->addMonths(self::VERIFICATION_TTL_MONTHS);
    }

    private function isExpired($verifiedAt): bool
    {
        return $verifiedAt === null || $this->expiresAt($verifiedAt)?->isPast();
    }
}
