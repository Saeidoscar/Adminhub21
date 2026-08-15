<?php

namespace App\Http\Controllers\Api\Users;

use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use App\Enums\PaymentGateway;
use App\Enums\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Users\VerifyUserLevelOneRequest;
use App\Http\Requests\Users\VerifyUserLevelTwoRequest;
use App\Http\Requests\Users\VerifyUserLevelThreeRequest;
use App\Models\Notification;
use App\Models\Option;
use App\Models\User;
use App\Models\UserVerification;
use App\Services\Identity\Data\UserVerificationAttempt;
use App\Services\Identity\UserBankIdentityVerificationService;
use App\Services\Identity\UserIdentityVerificationService;
use App\Services\Purchases\PurchasePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class UserVerificationController extends Controller
{
    private const API_TOKEN_NAME = 'dadline-api';

    private const VERIFICATION_TTL_MONTHS = 3;

    private const EXPIRY_WARNING_DAYS = 14;

    public function show(): JsonResponse
    {
        $user = request()->user()->loadMissing([
            'profile',
            'verification',
            'wallet',
        ]);

        $this->notifyIfVerificationNeedsAttention($user);

        return response()->json([
            'data' => $this->verificationPayload($user),
        ]);
    }

    public function levelOne(
        VerifyUserLevelOneRequest $request,
        PurchasePaymentService $payments,
        UserIdentityVerificationService $verificationService,
    ): JsonResponse
    {
        $user = $request->user()->loadMissing(['profile', 'verification', 'wallet']);
        $validated = $request->validated();
        $nationalId = $validated['national_id'];

        if (! $this->isValidIranianNationalId($nationalId)) {
            throw ValidationException::withMessages([
                'nationalId' => ['کد ملی وارد شده معتبر نیست.'],
            ]);
        }

        if (
            $user->verification?->identity_locked_at !== null
            && filled($user->profile?->national_id)
            && ! hash_equals((string) $user->profile->national_id, $nationalId)
        ) {
            throw ValidationException::withMessages([
                'nationalId' => ['کد ملی پس از احراز هویت سطح ۲ قابل تغییر نیست.'],
            ]);
        }

        $amount = $this->levelOneCost();

        if ($amount <= 0) {
            $attempt = $verificationService->verifyLevelOne($user, $nationalId);
            $this->assertAttemptMatched($attempt, 'nationalId');

            return response()->json([
                'message' => $attempt->message,
                'data' => $this->verificationPayload($user->fresh(['profile', 'verification', 'wallet'])),
            ]);
        }

        $result = $payments->start(
            user: $user,
            purchaseType: 'user_verification_level_one',
            purchasableId: $user->id,
            amount: $amount,
            walletType: WalletTransactionType::VerifyCost,
            payload: [
                'national_id' => $nationalId,
                'mobile' => $user->mobile,
                'description' => 'هزینه احراز هویت سطح ۱',
                'return_url' => $validated['return_url'] ?? null,
                'return_context' => $validated['return_context'] ?? 'user_verification_level_one',
            ],
            preferredGateway: $this->gateway($validated['gateway'] ?? null)
        );

        if ($result['resource'] instanceof UserVerificationAttempt) {
            $this->assertAttemptMatched($result['resource'], 'nationalId');
        }

        return response()->json([
            'message' => $result['requires_gateway']
                ? 'برای تکمیل احراز هویت سطح ۱، پرداخت را انجام دهید.'
                : ($result['resource']?->message ?? 'کد ملی و موبایل شما با موفقیت تایید شد.'),
            'data' => [
                ...$this->verificationPayload($user->fresh(['profile', 'verification', 'wallet'])),
                'payment' => $this->paymentPayload($result),
            ],
        ]);
    }

    public function levelTwo(
        VerifyUserLevelTwoRequest $request,
        PurchasePaymentService $payments,
        UserIdentityVerificationService $verificationService,
    ): JsonResponse
    {
        $user = $request->user()->loadMissing(['profile', 'verification', 'wallet']);
        $birthDate = $request->validated('birth_date');

        if (! $this->hasActiveLevelOne($user->verification) || blank($user->profile?->national_id)) {
            throw ValidationException::withMessages([
                'birthDate' => ['ابتدا احراز هویت سطح ۱ را تکمیل یا تمدید کنید.'],
            ]);
        }

        $amount = $this->levelTwoCost();
        $validated = $request->validated();

        if ($amount <= 0) {
            $attempt = $verificationService->verifyLevelTwo($user, $birthDate);
            $this->assertAttemptMatched($attempt, 'birthDate');

            return response()->json([
                'message' => $attempt->message,
                'data' => $this->verificationPayload($user->fresh(['profile', 'verification', 'wallet'])),
            ]);
        }

        $result = $payments->start(
            user: $user,
            purchaseType: 'user_verification_level_two',
            purchasableId: $user->id,
            amount: $amount,
            walletType: WalletTransactionType::VerifyCost,
            payload: [
                'birth_date' => $birthDate,
                'nationalCode' => $user->profile?->national_id,
                'mobile' => $user->mobile,
                'description' => 'هزینه احراز هویت سطح ۲',
                'return_url' => $validated['return_url'] ?? null,
                'return_context' => $validated['return_context'] ?? 'user_verification_level_two',
            ],
            preferredGateway: $this->gateway($validated['gateway'] ?? null)
        );

        if ($result['resource'] instanceof UserVerificationAttempt) {
            $this->assertAttemptMatched($result['resource'], 'birthDate');
        }

        return response()->json([
            'message' => $result['requires_gateway']
                ? 'برای تکمیل احراز هویت، پرداخت را انجام دهید.'
                : ($result['resource']?->message ?? 'احراز هویت سطح ۲ با موفقیت تایید شد.'),
            'data' => [
                ...$this->verificationPayload($user->fresh(['profile', 'verification', 'wallet'])),
                'payment' => $this->paymentPayload($result),
            ],
        ]);
    }

    public function levelThree(
        VerifyUserLevelThreeRequest $request,
        UserBankIdentityVerificationService $bankIdentityVerification,
    ): JsonResponse {
        $user = $request->user()->loadMissing(['profile', 'verification', 'wallet']);

        if (! $this->hasActiveLevelTwo($user->verification)) {
            throw ValidationException::withMessages([
                'bankVerification' => ['ابتدا احراز هویت فعال سطح ۲ را تکمیل کنید.'],
            ]);
        }

        if ($bankIdentityVerification->isCompleted($user)) {
            return response()->json([
                'message' => 'احراز هویت بانکی شما قبلاً تکمیل شده است.',
                'data' => $this->verificationPayload($user),
            ]);
        }

        $validated = $request->validated();
        $result = $bankIdentityVerification->start(
            user: $user,
            preferredGateway: $this->bankVerificationGateway($validated['gateway'] ?? null),
            returnUrl: $validated['return_url'] ?? null,
            returnContext: $validated['return_context'] ?? UserBankIdentityVerificationService::PURCHASE_TYPE,
        );

        return response()->json([
            'message' => 'برای تکمیل احراز هویت بانکی سطح ۳، پرداخت را انجام دهید.',
            'data' => [
                ...$this->verificationPayload($user->fresh(['profile', 'verification', 'wallet'])),
                'payment' => [
                    'requiresGateway' => true,
                    'paymentUrl' => $result['payment_url'],
                    'paymentId' => $result['payment']->id,
                    'gateway' => $result['payment']->gateway,
                    'gatewayToken' => $result['payment']->gateway_token,
                ],
            ],
        ]);
    }

    public function apiToken(): JsonResponse
    {
        $user = request()->user()->loadMissing(['profile', 'verification']);

        if (! $this->hasActiveLevelTwo($user->verification)) {
            throw ValidationException::withMessages([
                'apiToken' => ['جهت دسترسی به توکن API نیاز به احراز هویت فعال سطح ۲ می‌باشد.'],
            ]);
        }

        $user->tokens()
            ->where('name', self::API_TOKEN_NAME)
            ->delete();

        $token = $user->createToken(
            self::API_TOKEN_NAME,
            ['dadline:api'],
        )->plainTextToken;

        return response()->json([
            'message' => 'توکن دسترسی API فعال شد.',
            'data' => [
                ...$this->verificationPayload($user),
                'apiToken' => [
                    ...$this->apiTokenPayload($user),
                    'plainTextToken' => $token,
                ],
            ],
        ]);
    }

    private function verificationPayload(User $user): array
    {
        $user->loadMissing(['profile', 'verification', 'wallet']);
        $verification = $user->verification;
        $wallet = $user->wallet;
        $mobileExpiresAt = $this->expiresAt($verification?->mobile_verified_at);
        $nationalExpiresAt = $this->expiresAt($verification?->national_verified_at);
        $mobileExpired = $this->isExpired($verification?->mobile_verified_at);
        $nationalExpired = $this->isExpired($verification?->national_verified_at);
        $activeVerifiedLevel = $this->activeVerifiedLevel($verification);

        return [
            'user' => [
                'mobile' => $user->mobile,
            ],
            'profile' => [
                'nationalId' => $user->profile?->national_id,
                'birthDate' => $user->profile?->birth_date,
            ],
            'verification' => [
                'verifiedLevel' => (int) ($verification?->verified_level ?? 0),
                'activeVerifiedLevel' => $activeVerifiedLevel,
                'mobileVerified' => (bool) ($verification?->mobile_verified ?? false),
                'mobileVerifiedAt' => $verification?->mobile_verified_at?->toISOString(),
                'mobileExpiresAt' => $mobileExpiresAt?->toISOString(),
                'mobileExpired' => $mobileExpired,
                'nationalVerified' => (bool) ($verification?->national_verified ?? false),
                'nationalVerifiedAt' => $verification?->national_verified_at?->toISOString(),
                'nationalExpiresAt' => $nationalExpiresAt?->toISOString(),
                'nationalExpired' => $nationalExpired,
                'needsRenewal' => $this->needsRenewal($verification),
                'identityLocked' => $verification?->identity_locked_at !== null,
                'identityLockedAt' => $verification?->identity_locked_at?->toISOString(),
                'bankVerified' => $this->hasActiveLevelThree($verification),
                'bankVerifiedAt' => $verification?->bank_verified_at?->toISOString(),
                'renewalMessage' => $this->renewalMessage($verification),
            ],
            'pricing' => [
                'levelOneCost' => $this->levelOneCost(),
                'levelTwoCost' => $this->levelTwoCost(),
                'levelThreeDepositAmount' => $this->levelThreeDepositAmount(),
                'currency' => 'IRT',
                'currencyLabel' => 'تومان',
            ],
            'wallet' => [
                'balance' => (int) ($wallet?->balance ?? 0),
                'withdrawableBalance' => (int) ($wallet?->withdrawable_balance ?? 0),
                'blockedBalance' => (int) ($wallet?->blocked_balance ?? 0),
            ],
            'apiToken' => $this->apiTokenPayload($user),
        ];
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

    private function apiTokenPayload(User $user): array
    {
        $token = $user->tokens()
            ->where('name', self::API_TOKEN_NAME)
            ->latest('id')
            ->first();

        return [
            'enabled' => (bool) $token,
            'createdAt' => $token?->created_at?->toISOString(),
            'lastUsedAt' => $token?->last_used_at?->toISOString(),
            'plainTextToken' => null,
        ];
    }

    private function levelOneCost(): int
    {
        $value = Option::get('verify_level_one_cost', 0);

        return is_numeric($value) ? max(0, (int) $value) : 0;
    }

    private function levelTwoCost(): int
    {
        $value = Option::get('verify_cost', 22000);

        return is_numeric($value) ? max(0, (int) $value) : 22000;
    }

    private function levelThreeDepositAmount(): int
    {
        $value = Option::get('verify_level_three_deposit_amount', 10_000);

        return is_numeric($value) ? max(1, (int) $value) : 10_000;
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

    private function bankVerificationGateway(?string $gateway): ?PaymentGateway
    {
        return match ($gateway) {
            PaymentGateway::Sep->value => PaymentGateway::Sep,
            PaymentGateway::Zibal->value => PaymentGateway::Zibal,
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

    private function activeVerifiedLevel(?UserVerification $verification): int
    {
        if ($this->hasActiveLevelThree($verification)) {
            return 3;
        }

        if ($this->hasActiveLevelTwo($verification)) {
            return 2;
        }

        if ($this->hasActiveLevelOne($verification)) {
            return 1;
        }

        return 0;
    }

    private function hasActiveLevelOne(?UserVerification $verification): bool
    {
        return (bool) $verification?->mobile_verified
            && (int) ($verification?->verified_level ?? 0) >= 1
            && ! $this->isExpired($verification?->mobile_verified_at);
    }

    private function hasActiveLevelTwo(?UserVerification $verification): bool
    {
        return $this->hasActiveLevelOne($verification)
            && (bool) $verification?->national_verified
            && (int) ($verification?->verified_level ?? 0) >= 2
            && ! $this->isExpired($verification?->national_verified_at);
    }

    private function hasActiveLevelThree(?UserVerification $verification): bool
    {
        return $this->hasActiveLevelTwo($verification)
            && (bool) $verification?->bank_verified
            && (int) ($verification?->verified_level ?? 0) >= 3
            && $verification?->bank_verified_at !== null;
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

    private function needsRenewal(?UserVerification $verification): bool
    {
        return ((int) ($verification?->verified_level ?? 0) >= 1 && $this->isExpired($verification?->mobile_verified_at))
            || ((int) ($verification?->verified_level ?? 0) >= 2 && $this->isExpired($verification?->national_verified_at))
            || $this->expiresSoon($verification?->mobile_verified_at)
            || $this->expiresSoon($verification?->national_verified_at);
    }

    private function renewalMessage(?UserVerification $verification): ?string
    {
        if ((int) ($verification?->verified_level ?? 0) >= 1 && $this->isExpired($verification?->mobile_verified_at)) {
            return 'اعتبار احراز هویت سطح ۱ به پایان رسیده است. لطفاً احراز هویت را تمدید کنید.';
        }

        if ((int) ($verification?->verified_level ?? 0) >= 2 && $this->isExpired($verification?->national_verified_at)) {
            return 'اعتبار احراز هویت سطح ۲ به پایان رسیده است. لطفاً احراز هویت را تمدید کنید.';
        }

        if ($this->expiresSoon($verification?->national_verified_at)) {
            return 'اعتبار احراز هویت سطح ۲ به‌زودی منقضی می‌شود.';
        }

        if ($this->expiresSoon($verification?->mobile_verified_at)) {
            return 'اعتبار احراز هویت سطح ۱ به‌زودی منقضی می‌شود.';
        }

        return null;
    }

    private function notifyIfVerificationNeedsAttention(User $user): void
    {
        if (! $this->needsRenewal($user->verification)) {
            return;
        }

        $message = $this->renewalMessage($user->verification);

        if (! $message) {
            return;
        }

        $type = str_contains($message, 'به‌زودی')
            ? 'verification_expiring'
            : 'verification_expired';

        $alreadyNotifiedToday = Notification::query()
            ->where('user_id', $user->id)
            ->where('payload->type', $type)
            ->whereDate('created_at', now()->toDateString())
            ->exists();

        if ($alreadyNotifiedToday) {
            return;
        }

        Notification::query()->create([
            'user_id' => $user->id,
            'channel' => NotificationChannel::Push->value,
            'recipient' => $user->mobile,
            'payload' => [
                'type' => $type,
                'title' => 'تمدید احراز هویت',
                'message' => $message,
                'href' => '/pishkhan/profile/verification',
            ],
            'status' => NotificationStatus::Pending->value,
        ]);
    }

    private function isValidIranianNationalId(string $nationalId): bool
    {
        if (! preg_match('/^\d{10}$/', $nationalId)) {
            return false;
        }

        if (preg_match('/^(\d)\1{9}$/', $nationalId)) {
            return false;
        }

        $sum = 0;

        for ($index = 0; $index < 9; $index++) {
            $sum += (int) $nationalId[$index] * (10 - $index);
        }

        $remainder = $sum % 11;
        $checkDigit = (int) $nationalId[9];

        return $remainder < 2
            ? $checkDigit === $remainder
            : $checkDigit === 11 - $remainder;
    }
}
