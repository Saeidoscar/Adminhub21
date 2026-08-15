<?php

namespace App\Services\Purchases;

use App\Enums\PaymentGateway;
use App\Enums\PurchaseIntentStatus;
use App\Enums\WalletPaymentStatus;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\ExternalServiceRequest;
use App\Models\PurchaseIntent;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\WalletTransactionPayment;
use App\Services\ExternalServices\Exceptions\ExternalServiceException;
use App\Services\Identity\Data\UserVerificationAttempt;
use App\Services\Payments\PaymentCallbackUrl;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\Wallet\WalletService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class PurchasePaymentService
{
    public function __construct(
        private WalletService $wallets,
        private PaymentGatewayManager $gateways,
        private PaymentCallbackUrl $callbackUrl,
        private PlatformRevenueCalculator $revenue,
        private FinancialLedgerService $ledger,
        private AffiliateCommissionService $affiliates,
        private FulfillPurchaseService $fulfillment
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function start(
        User $user,
        string $purchaseType,
        ?int $purchasableId,
        int $amount,
        WalletTransactionType $walletType,
        array $payload = [],
        ?PaymentGateway $preferredGateway = null,
        ?int $vendorId = null
    ): array {
        $wallet = $this->wallets->ensureWallet($user)->refresh();

        $intent = PurchaseIntent::query()->create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $user->id,
            'purchase_type' => $purchaseType,
            'purchasable_id' => $purchasableId,
            'vendor_id' => $vendorId,
            'amount' => $amount,
            'wallet_type' => $walletType,
            'status' => PurchaseIntentStatus::PendingWallet,
            'payload' => $payload,
        ]);

        if ($this->wallets->spendableBalance($wallet) >= $amount) {
            return $this->completeFromWallet($intent);
        }

        return $this->createGatewayCharge($intent, $preferredGateway);
    }

    /**
     * @return array<string, mixed>
     */
    public function verifyPayment(WalletTransactionPayment $payment, array $payload = []): array
    {
        $payment->loadMissing('transaction');
        $intent = PurchaseIntent::query()
            ->where('charge_transaction_id', $payment->transaction_id)
            ->firstOrFail();

        if ($intent->status === PurchaseIntentStatus::Completed) {
            return $this->response($intent, null, $payment);
        }

        if (
            $intent->status === PurchaseIntentStatus::Paid
            && $payment->status === WalletPaymentStatus::Completed
            && $payment->verified
        ) {
            return $this->completeFromWallet($intent->refresh(), $payment);
        }

        $verification = $this->gateways->verify($payment, $payload);

        if (! $verification->successful) {
            $payment->forceFill([
                'status' => WalletPaymentStatus::Failed,
                'response_payload' => $verification->payload,
            ])->save();

            $payment->transaction->forceFill([
                'status' => WalletTransactionStatus::Failed,
            ])->save();

            $intent->forceFill([
                'status' => PurchaseIntentStatus::Failed,
            ])->save();

            throw ValidationException::withMessages([
                'payment' => 'Payment verification failed.',
            ]);
        }

        DB::transaction(function () use ($intent, $payment, $verification): void {
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

            $this->wallets->completeBlockedDeposit($payment->transaction);

            $intent->forceFill([
                'status' => PurchaseIntentStatus::Paid,
                'paid_at' => now(),
            ])->save();
        });

        // Fulfillment intentionally runs after the verified gateway deposit is committed.
        // A technical inquiry failure therefore leaves the paid amount in the user's wallet
        // and does not consume the inquiry cost.
        return $this->completeFromWallet($intent->refresh(), $payment->refresh());
    }

    /**
     * @return array<string, mixed>
     */
    private function completeFromWallet(PurchaseIntent $intent, ?WalletTransactionPayment $payment = null): array
    {
        try {
            return DB::transaction(function () use ($intent, $payment): array {
                $intent = PurchaseIntent::query()
                    ->whereKey($intent->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($intent->status === PurchaseIntentStatus::Completed) {
                    return $this->response($intent, null, $payment);
                }

                $purchaseTx = $intent->purchaseTransaction;

                if ($purchaseTx === null) {
                    $purchaseTx = $this->wallets->withdrawForPurchase(
                        user: $intent->user,
                        amount: $intent->amount,
                        type: $intent->wallet_type,
                        payload: [
                            'purchase_intent_id' => $intent->id,
                            'purchase_type' => $intent->purchase_type,
                            'purchasable_id' => $intent->purchasable_id,
                        ]
                    );

                    $intent->forceFill([
                        'purchase_transaction_id' => $purchaseTx->id,
                    ])->save();
                }

                $breakdown = $intent->vendor_id === null
                    ? $this->revenue->forPlatformPurchase($intent->amount)
                    : $this->revenue->forVendorPurchase($intent->amount, $intent->vendor);

                $this->ledger->recordIncome($intent, $breakdown);
                $this->affiliates->createBlockedCommission($intent->refresh(), $breakdown->netIncome);
                $resource = $this->fulfillment->execute($intent->refresh());

                if ($resource instanceof UserVerificationAttempt) {
                    $this->markExternalInquiryBilled($resource, $intent, $purchaseTx);

                    $intentPayload = $intent->payload ?? [];
                    $intentPayload['fulfillment'] = $resource->toArray();
                    $intent->forceFill(['payload' => $intentPayload])->save();
                }

                $intent->forceFill([
                    'status' => PurchaseIntentStatus::Completed,
                    'completed_at' => now(),
                ])->save();

                return $this->response($intent->refresh(), $resource, $payment);
            });
        } catch (ExternalServiceException $exception) {
            $this->persistTechnicalInquiryFailure($exception, $intent);

            $intent->refresh();

            if ($intent->status === PurchaseIntentStatus::PendingWallet) {
                $intent->forceFill(['status' => PurchaseIntentStatus::Failed])->save();
            }

            throw $exception;
        }
    }

    private function persistTechnicalInquiryFailure(
        ExternalServiceException $exception,
        PurchaseIntent $intent,
    ): void {
        foreach ($this->technicalInquirySnapshots($exception) as $snapshot) {
            try {
                ExternalServiceRequest::query()->updateOrCreate(
                    ['uuid' => (string) $snapshot['uuid']],
                    [
                        ...$snapshot,
                        'user_id' => $snapshot['user_id'] ?? $intent->user_id,
                        'purchase_intent_id' => $intent->id,
                        'wallet_transaction_id' => null,
                        'billable' => false,
                        'billed_amount' => null,
                        'billed_at' => null,
                    ],
                );
            } catch (Throwable $auditException) {
                report($auditException);
            }
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function technicalInquirySnapshots(ExternalServiceException $exception): array
    {
        $snapshots = [];
        $multiple = $exception->context['external_requests'] ?? null;
        $single = $exception->context['external_request'] ?? null;

        if (is_array($multiple)) {
            foreach ($multiple as $snapshot) {
                if (is_array($snapshot)) {
                    $snapshots[] = $snapshot;
                }
            }
        }

        if (is_array($single)) {
            $snapshots[] = $single;
        }

        return collect($snapshots)
            ->filter(fn (array $snapshot): bool => filled($snapshot['uuid'] ?? null))
            ->unique(fn (array $snapshot): string => (string) $snapshot['uuid'])
            ->values()
            ->all();
    }

    private function markExternalInquiryBilled(
        UserVerificationAttempt $attempt,
        PurchaseIntent $intent,
        WalletTransaction $purchaseTx,
    ): void {
        $requestId = $attempt->externalResult->requestId;

        if ($requestId === null || ! $attempt->externalResult->billable) {
            return;
        }

        ExternalServiceRequest::query()
            ->whereKey($requestId)
            ->where('billable', true)
            ->whereNull('billed_at')
            ->update([
                'purchase_intent_id' => $intent->id,
                'wallet_transaction_id' => $purchaseTx->id,
                'billed_amount' => $intent->amount,
                'billed_at' => now(),
            ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function createGatewayCharge(PurchaseIntent $intent, ?PaymentGateway $preferredGateway): array
    {
        $charge = $this->wallets->createPendingOnlineCharge($intent->user, $intent->amount, [
            'purchase_intent_id' => $intent->id,
            'purchase_type' => $intent->purchase_type,
            'purchasable_id' => $intent->purchasable_id,
            'gateway_policy' => $preferredGateway?->value ?? 'smart',
        ]);

        $payment = WalletTransactionPayment::query()->create([
            'transaction_id' => $charge->id,
            'gateway' => ($preferredGateway ?? PaymentGateway::Sep)->value,
            'amount' => $charge->amount,
            'status' => WalletPaymentStatus::Pending,
            'request_payload' => [
                'purchase_intent_id' => $intent->id,
                'purchase_type' => $intent->purchase_type,
                'return_url' => $intent->payload['return_url'] ?? null,
                'return_context' => $intent->payload['return_context'] ?? null,
            ],
        ]);

        $intent->forceFill([
            'charge_transaction_id' => $charge->id,
            'status' => PurchaseIntentStatus::PendingGateway,
        ])->save();

        $initiation = $this->gateways->initiateSmart(
            amount: $charge->amount,
            callbackUrl: $this->callbackUrl->forPayment($payment->id, $preferredGateway),
            metadata: [
                'payment_id' => $payment->id,
                'purchase_intent_id' => $intent->id,
                'purchasable_id' => $intent->purchasable_id,
                'description' => $intent->payload['description'] ?? null,
                'mobile' => $intent->payload['mobile'] ?? $intent->user->mobile,
                'nationalCode' => $intent->payload['nationalCode'] ?? null,
            ],
            preferredGateway: $preferredGateway
        );

        $payment->forceFill([
            'gateway' => $initiation->gateway,
            'gateway_token' => $initiation->token,
            'authority' => $initiation->authority,
            'ref_num' => $initiation->refNum,
            'payment_url' => $initiation->paymentUrl,
            'request_payload' => [
                'purchase_intent_id' => $intent->id,
                'purchase_type' => $intent->purchase_type,
                'return_url' => $intent->payload['return_url'] ?? null,
                'return_context' => $intent->payload['return_context'] ?? null,
                'gateway_response' => $initiation->payload,
            ],
        ])->save();

        return $this->response($intent->refresh(), null, $payment->refresh());
    }

    /**
     * @return array<string, mixed>
     */
    private function response(PurchaseIntent $intent, mixed $resource = null, ?WalletTransactionPayment $payment = null): array
    {
        return [
            'intent' => $intent,
            'resource' => $resource,
            'payment' => $payment,
            'requires_gateway' => $payment !== null && $intent->status === PurchaseIntentStatus::PendingGateway,
            'payment_url' => $payment?->payment_url,
        ];
    }
}
