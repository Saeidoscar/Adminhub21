<?php

namespace App\Services\Identity;

use App\Enums\PaymentGateway;
use App\Enums\WalletPaymentStatus;
use App\Enums\WalletTransactionStatus;
use App\Models\Option;
use App\Models\User;
use App\Models\UserVerification;
use App\Models\WalletTransactionPayment;
use App\Services\Payments\PaymentCallbackUrl;
use App\Services\Payments\PaymentGatewayException;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\Payments\PaymentVerificationResult;
use App\Services\Wallet\WalletService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserBankIdentityVerificationService
{
    public const PURCHASE_TYPE = 'user_verification_level_three';

    private const VERIFICATION_TTL_MONTHS = 3;

    /** @var array<int, string> */
    private const ALLOWED_OWNERSHIP_METHODS = [
        'sep_verify_national_code',
        'zibal_request_national_code',
    ];

    public function __construct(
        private readonly WalletService $wallets,
        private readonly PaymentGatewayManager $gateways,
        private readonly PaymentCallbackUrl $callbackUrl,
    ) {}

    /**
     * @return array{payment: WalletTransactionPayment, payment_url: ?string}
     */
    public function start(
        User $user,
        ?PaymentGateway $preferredGateway = null,
        ?string $returnUrl = null,
        ?string $returnContext = null,
    ): array {
        $user->loadMissing(['profile', 'verification', 'wallet']);
        $this->assertEligible($user);

        if ($this->isCompleted($user)) {
            throw ValidationException::withMessages([
                'bankVerification' => ['احراز هویت بانکی شما قبلاً تکمیل شده است.'],
            ]);
        }

        if ($preferredGateway === PaymentGateway::SnappPay) {
            throw ValidationException::withMessages([
                'gateway' => ['احراز هویت بانکی فقط از طریق درگاه دارای کنترل مالک کارت قابل انجام است.'],
            ]);
        }

        $amount = $this->depositAmount();
        $amountRial = $this->tomanToRial($amount);
        $nationalCode = (string) $user->profile->national_id;
        $mobile = (string) $user->mobile;
        $context = $returnContext ?: self::PURCHASE_TYPE;

        [$transaction, $payment] = DB::transaction(function () use (
            $amount,
            $amountRial,
            $context,
            $mobile,
            $nationalCode,
            $preferredGateway,
            $returnUrl,
            $user,
        ): array {
            $transaction = $this->wallets->createPendingOnlineCharge($user, $amount, [
                'purchase_type' => self::PURCHASE_TYPE,
                'national_code' => $nationalCode,
                'mobile' => $mobile,
                'expected_amount_rial' => $amountRial,
                'card_owner_verification_required' => true,
                'gateway_policy' => $preferredGateway?->value ?? 'smart',
            ]);

            $payment = WalletTransactionPayment::query()->create([
                'transaction_id' => $transaction->id,
                'gateway' => ($preferredGateway ?? PaymentGateway::Sep)->value,
                'amount' => $transaction->amount,
                'status' => WalletPaymentStatus::Pending,
                'request_payload' => [
                    'purchase_type' => self::PURCHASE_TYPE,
                    'user_id' => $user->id,
                    'national_code' => $nationalCode,
                    'mobile' => $mobile,
                    'expected_amount' => $amount,
                    'expected_amount_rial' => $amountRial,
                    'card_owner_verification_required' => true,
                    'ignore_national_code' => false,
                    'return_url' => $returnUrl,
                    'return_context' => $context,
                ],
            ]);

            return [$transaction, $payment];
        });

        try {
            $initiation = $this->gateways->initiateSmart(
                amount: $amount,
                callbackUrl: $this->callbackUrl->forPayment($payment->id, $preferredGateway),
                metadata: [
                    'payment_id' => $payment->id,
                    'description' => 'احراز هویت بانکی سطح ۳ دادلاین',
                    'mobile' => $mobile,
                    'nationalCode' => $nationalCode,
                    'enforceCardOwnerNationalCode' => true,
                    'category' => 'identity_verification',
                ],
                preferredGateway: $preferredGateway,
            );
        } catch (PaymentGatewayException $exception) {
            DB::transaction(function () use ($exception, $payment, $transaction): void {
                $transaction->forceFill([
                    'status' => WalletTransactionStatus::Failed,
                ])->save();

                $payment->forceFill([
                    'status' => WalletPaymentStatus::Failed,
                    'response_payload' => $this->gatewayExceptionPayload($exception),
                ])->save();
            });

            throw ValidationException::withMessages([
                'gateway' => ['اتصال به درگاه بانکی برقرار نشد؛ کمی بعد دوباره تلاش کنید.'],
            ]);
        }

        if (! $initiation->cardOwnerVerificationEnforced) {
            DB::transaction(function () use ($payment, $transaction): void {
                $transaction->forceFill(['status' => WalletTransactionStatus::Failed])->save();
                $payment->forceFill([
                    'status' => WalletPaymentStatus::Failed,
                    'response_payload' => [
                        'failure_reason' => 'gateway_did_not_enforce_card_owner',
                    ],
                ])->save();
            });

            throw ValidationException::withMessages([
                'gateway' => ['درگاه انتخاب‌شده امکان کنترل مالک کارت را فعال نکرد.'],
            ]);
        }

        $requestPayload = $payment->request_payload ?? [];
        $requestPayload['gateway_response'] = $initiation->payload;
        $requestPayload['gateway_card_owner_verification_enforced'] = true;
        $requestPayload['gateway_card_owner_verification_method'] = $initiation->cardOwnerVerificationMethod;

        $payment->forceFill([
            'gateway' => $initiation->gateway,
            'gateway_token' => $initiation->token,
            'authority' => $initiation->authority,
            'ref_num' => $initiation->refNum,
            'terminal_id' => $initiation->terminalId,
            'payment_url' => $initiation->paymentUrl,
            'request_payload' => $requestPayload,
        ])->save();

        return [
            'payment' => $payment->refresh(),
            'payment_url' => $payment->payment_url,
        ];
    }

    public function complete(
        WalletTransactionPayment $payment,
        PaymentVerificationResult $gatewayResult,
    ): UserVerification {
        return DB::transaction(function () use ($gatewayResult, $payment): UserVerification {
            $payment = WalletTransactionPayment::query()
                ->with(['transaction.user.profile', 'transaction.user.verification'])
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $transaction = $payment->transaction;
            $user = $transaction->user;

            if (($payment->request_payload['purchase_type'] ?? null) !== self::PURCHASE_TYPE) {
                throw ValidationException::withMessages([
                    'payment' => ['این پرداخت مربوط به احراز هویت بانکی نیست.'],
                ]);
            }

            if (
                $payment->status === WalletPaymentStatus::Completed
                && $payment->verified
                && $transaction->status === WalletTransactionStatus::Completed
                && $this->isCompleted($user)
            ) {
                return $user->verification;
            }

            if (! in_array($payment->gateway, [PaymentGateway::Sep->value, PaymentGateway::Zibal->value], true)) {
                throw ValidationException::withMessages([
                    'payment' => ['درگاه این پرداخت قابلیت کنترل مالک کارت را ندارد.'],
                ]);
            }

            if (! $gatewayResult->successful || ! $gatewayResult->ownershipChecked) {
                throw ValidationException::withMessages([
                    'payment' => [
                        $gatewayResult->resultMessage
                            ?: 'مالکیت کارت بانکی پرداخت‌کننده تایید نشد.',
                    ],
                ]);
            }

            if (! in_array($gatewayResult->ownershipMethod, self::ALLOWED_OWNERSHIP_METHODS, true)) {
                throw ValidationException::withMessages([
                    'payment' => ['روش کنترل مالک کارت این پرداخت معتبر نیست.'],
                ]);
            }

            $expectedAmount = (int) ($payment->request_payload['expected_amount'] ?? 0);
            $expectedAmountRial = (int) ($payment->request_payload['expected_amount_rial'] ?? 0);

            if (
                $expectedAmount <= 0
                || $expectedAmountRial !== $this->tomanToRial($expectedAmount)
                || (int) $payment->amount !== $expectedAmount
                || (int) $transaction->amount !== $expectedAmount
                || $gatewayResult->verifiedAmountRial !== $expectedAmountRial
            ) {
                throw ValidationException::withMessages([
                    'payment' => ['مبلغ تاییدشده توسط درگاه با مبلغ احراز هویت بانکی مطابقت ندارد.'],
                ]);
            }

            if ($payment->gateway === PaymentGateway::Sep->value) {
                $expectedTerminalId = (string) ($payment->terminal_id ?? '');

                if (
                    $expectedTerminalId === ''
                    || $gatewayResult->terminalId === null
                    || ! hash_equals($expectedTerminalId, $gatewayResult->terminalId)
                    || blank($gatewayResult->refNum)
                ) {
                    throw ValidationException::withMessages([
                        'payment' => ['اطلاعات مرجع یا پایانه پرداخت سپ معتبر نیست.'],
                    ]);
                }
            }

            $expectedNationalCode = (string) ($payment->request_payload['national_code'] ?? '');
            $currentNationalCode = (string) $user->profile?->national_id;

            if (
                $expectedNationalCode === ''
                || $currentNationalCode === ''
                || ! hash_equals($expectedNationalCode, $currentNationalCode)
            ) {
                throw ValidationException::withMessages([
                    'payment' => ['کد ملی پرداخت با اطلاعات هویتی حساب مطابقت ندارد.'],
                ]);
            }

            $payment->forceFill([
                'ref_num' => $gatewayResult->refNum ?? $payment->ref_num,
                'rrn' => $gatewayResult->rrn,
                'terminal_id' => $gatewayResult->terminalId ?? $payment->terminal_id,
                'card_number_masked' => $gatewayResult->cardNumberMasked,
                'gateway_fee' => $gatewayResult->gatewayFee,
                'status' => WalletPaymentStatus::Completed,
                'verified' => true,
                'verified_at' => $payment->verified_at ?? now(),
                'response_payload' => $gatewayResult->payload,
            ])->save();

            $this->wallets->completeWithdrawableDeposit($transaction);

            $verification = $user->verification()->firstOrNew(['user_id' => $user->id]);
            $verifiedAt = $verification->bank_verified_at ?? now();
            $verification->forceFill([
                'verified_level' => max((int) $verification->verified_level, 3),
                'bank_verified' => true,
                'bank_verified_at' => $verifiedAt,
                'bank_data' => [
                    'verified_at' => $verifiedAt->toISOString(),
                    'national_code' => $expectedNationalCode,
                    'ownership_check' => 'gateway_national_code',
                    'ownership_method' => $gatewayResult->ownershipMethod,
                    'amount' => $payment->amount,
                    'amount_rial' => $gatewayResult->verifiedAmountRial,
                    'wallet_transaction_id' => $transaction->id,
                    'payment_id' => $payment->id,
                    'gateway' => $payment->gateway,
                    'ref_num' => $payment->ref_num,
                    'rrn' => $payment->rrn,
                    'terminal_id' => $payment->terminal_id,
                    'card_number_masked' => $payment->card_number_masked,
                    'gateway_result_code' => $gatewayResult->resultCode,
                    'gateway_result_message' => $gatewayResult->resultMessage,
                ],
            ])->save();

            return $verification->refresh();
        });
    }

    public function isCompleted(User $user): bool
    {
        $user->loadMissing('verification');
        $verification = $user->verification;

        return (bool) $verification?->bank_verified
            && (int) ($verification?->verified_level ?? 0) >= 3
            && $verification?->bank_verified_at !== null
            && ($verification?->bank_data['ownership_check'] ?? null) === 'gateway_national_code'
            && in_array(
                $verification?->bank_data['ownership_method'] ?? null,
                self::ALLOWED_OWNERSHIP_METHODS,
                true,
            );
    }

    public function depositAmount(): int
    {
        $value = Option::get('verify_level_three_deposit_amount', 10_000);

        return is_numeric($value) ? max(1, (int) $value) : 10_000;
    }

    private function assertEligible(User $user): void
    {
        $verification = $user->verification;

        if (
            ! (bool) $verification?->mobile_verified
            || ! (bool) $verification?->national_verified
            || (int) ($verification?->verified_level ?? 0) < 2
            || $verification?->mobile_verified_at === null
            || $verification?->national_verified_at === null
            || $verification->mobile_verified_at->copy()->addMonths(self::VERIFICATION_TTL_MONTHS)->isPast()
            || $verification->national_verified_at->copy()->addMonths(self::VERIFICATION_TTL_MONTHS)->isPast()
            || blank($user->profile?->national_id)
        ) {
            throw ValidationException::withMessages([
                'bankVerification' => ['برای احراز هویت بانکی، ابتدا احراز هویت فعال سطح ۲ را تکمیل کنید.'],
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function gatewayExceptionPayload(PaymentGatewayException $exception): array
    {
        return [
            'error' => $exception->getMessage(),
            'retryable' => $exception->retryable,
            ...$exception->context,
        ];
    }

    private function tomanToRial(int $amount): int
    {
        return $amount * 10;
    }
}
