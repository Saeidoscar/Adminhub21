<?php

namespace App\Http\Controllers\Api\Payments;

use App\Enums\WalletPaymentStatus;
use App\Enums\WalletTransactionStatus;
use App\Http\Controllers\Controller;
use App\Models\WalletTransactionPayment;
use App\Services\Identity\Data\UserVerificationAttempt;
use App\Services\Identity\UserBankIdentityVerificationService;
use App\Services\Payments\PaymentGatewayException;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\Payments\PaymentVerificationResult;
use App\Services\Purchases\PurchasePaymentService;
use App\Services\Wallet\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentCallbackController extends Controller
{
    public function __invoke(
        Request $request,
        WalletTransactionPayment $payment,
        PurchasePaymentService $payments,
        PaymentGatewayManager $gateways,
        WalletService $wallets,
        UserBankIdentityVerificationService $bankIdentityVerification,
    ): JsonResponse {
        $payment->loadMissing('transaction');

        if (($payment->request_payload['purchase_type'] ?? null) === UserBankIdentityVerificationService::PURCHASE_TYPE) {
            return $this->completeBankIdentityVerification(
                request: $request,
                payment: $payment,
                gateways: $gateways,
                bankIdentityVerification: $bankIdentityVerification,
            );
        }

        if (($payment->request_payload['purchase_type'] ?? null) === 'wallet_topup') {
            $verification = $gateways->verify($payment, $request->all());

            if (! $verification->successful) {
                $this->markPaymentFailed($payment, $verification->payload);

                throw ValidationException::withMessages([
                    'payment' => 'Payment verification failed.',
                ]);
            }

            DB::transaction(function () use ($payment, $verification, $wallets): void {
                $payment->forceFill([
                    'ref_num' => $verification->refNum ?? $payment->ref_num,
                    'rrn' => $verification->rrn,
                    'card_number_masked' => $verification->cardNumberMasked,
                    'gateway_fee' => $verification->gatewayFee,
                    'status' => WalletPaymentStatus::Completed,
                    'verified' => true,
                    'verified_at' => now(),
                    'response_payload' => $verification->payload,
                ])->save();

                $wallets->completeWithdrawableDeposit($payment->transaction);
            });

            return response()->json([
                'data' => [
                    'status' => WalletTransactionStatus::Completed->value,
                    'paymentId' => $payment->id,
                ],
            ]);
        }

        $result = $payments->verifyPayment($payment, $request->all());

        return response()->json([
            'data' => [
                'status' => $result['intent']->status->value,
                'purchaseIntentId' => $result['intent']->id,
                'purchaseIntentUuid' => $result['intent']->uuid,
                'paymentId' => $payment->id,
                'fulfillment' => $result['resource'] instanceof UserVerificationAttempt
                    ? $result['resource']->toArray()
                    : ($result['intent']->payload['fulfillment'] ?? null),
            ],
        ]);
    }

    private function completeBankIdentityVerification(
        Request $request,
        WalletTransactionPayment $payment,
        PaymentGatewayManager $gateways,
        UserBankIdentityVerificationService $bankIdentityVerification,
    ): JsonResponse {
        if (
            $payment->status === WalletPaymentStatus::Completed
            && $payment->verified
            && $payment->transaction->status === WalletTransactionStatus::Completed
        ) {
            return $this->bankIdentitySuccessResponse($payment);
        }

        if (in_array($payment->status, [WalletPaymentStatus::Failed, WalletPaymentStatus::Cancelled], true)) {
            throw ValidationException::withMessages([
                'payment' => ['این پرداخت قبلاً ناموفق یا لغو شده و قابل تایید مجدد نیست.'],
            ]);
        }

        try {
            $verification = $gateways->verify($payment, $request->all());
        } catch (PaymentGatewayException $exception) {
            $payload = [
                'error' => $exception->getMessage(),
                'retryable' => $exception->retryable,
                ...$exception->context,
            ];

            if ($exception->retryable) {
                $this->markPaymentProcessing($payment, $payload);

                return response()->json([
                    'message' => 'تایید پرداخت درگاه موقتاً در دسترس نیست؛ تراکنش برای بررسی مجدد نگه‌داری شد.',
                    'errors' => [
                        'payment' => ['تایید پرداخت درگاه موقتاً در دسترس نیست.'],
                    ],
                ], 503);
            }

            $this->markPaymentFailed($payment, $payload);

            throw ValidationException::withMessages([
                'payment' => ['اطلاعات پرداخت احراز هویت بانکی معتبر نیست.'],
            ]);
        }

        if (! $verification->successful) {
            $this->markPaymentFailed($payment, $verification->payload);

            throw ValidationException::withMessages([
                'payment' => [
                    $verification->resultMessage
                        ?: 'پرداخت یا مالکیت کارت بانکی توسط درگاه تایید نشد.',
                ],
            ]);
        }

        try {
            $bankIdentityVerification->complete($payment, $verification);
        } catch (ValidationException $exception) {
            $this->markPaymentFailed(
                $payment,
                $this->validationFailurePayload($verification, $exception),
            );

            throw $exception;
        }

        return $this->bankIdentitySuccessResponse($payment);
    }

    private function bankIdentitySuccessResponse(WalletTransactionPayment $payment): JsonResponse
    {
        return response()->json([
            'data' => [
                'status' => WalletTransactionStatus::Completed->value,
                'paymentId' => $payment->id,
                'fulfillment' => [
                    'matched' => true,
                    'status' => 'verified',
                ],
            ],
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function markPaymentFailed(WalletTransactionPayment $payment, array $payload): void
    {
        DB::transaction(function () use ($payload, $payment): void {
            $payment = WalletTransactionPayment::query()
                ->with('transaction')
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($payment->status === WalletPaymentStatus::Completed && $payment->verified) {
                return;
            }

            $payment->forceFill([
                'status' => WalletPaymentStatus::Failed,
                'response_payload' => $payload,
            ])->save();

            $payment->transaction->forceFill([
                'status' => WalletTransactionStatus::Failed,
            ])->save();
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function markPaymentProcessing(WalletTransactionPayment $payment, array $payload): void
    {
        DB::transaction(function () use ($payload, $payment): void {
            $payment = WalletTransactionPayment::query()
                ->with('transaction')
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($payment->status === WalletPaymentStatus::Completed && $payment->verified) {
                return;
            }

            $payment->forceFill([
                'status' => WalletPaymentStatus::Processing,
                'response_payload' => $payload,
            ])->save();

            $payment->transaction->forceFill([
                'status' => WalletTransactionStatus::Processing,
            ])->save();
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function validationFailurePayload(
        PaymentVerificationResult $verification,
        ValidationException $exception,
    ): array {
        return [
            ...$verification->payload,
            '_dadline_completion' => [
                'status' => 'failed',
                'validation_errors' => $exception->errors(),
            ],
        ];
    }
}
