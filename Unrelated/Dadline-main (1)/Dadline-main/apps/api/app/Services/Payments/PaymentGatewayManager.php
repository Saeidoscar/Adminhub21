<?php

namespace App\Services\Payments;

use App\Enums\PaymentGateway as PaymentGatewayEnum;
use App\Models\WalletTransactionPayment;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class PaymentGatewayManager
{
    public function __construct(
        private SepPaymentGateway $sep,
        private ZibalPaymentGateway $zibal,
        private SnappPayPaymentGateway $snappPay
    ) {}

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function initiateSmart(
        int $amount,
        string $callbackUrl,
        array $metadata = [],
        ?PaymentGatewayEnum $preferredGateway = null
    ): PaymentGatewayInitiation {
        if ($preferredGateway !== null) {
            return $this->gateway($preferredGateway)->initiate($amount, $callbackUrl, $metadata);
        }

        try {
            return $this->sep->initiate($amount, $callbackUrl, $metadata);
        } catch (PaymentGatewayException $exception) {
            if (! $exception->retryable) {
                throw $exception;
            }

            Log::warning('SEP initiation failed; falling back to Zibal.', [
                'amount' => $amount,
                'callback_host' => parse_url($callbackUrl, PHP_URL_HOST),
                'payment_id' => $metadata['payment_id'] ?? null,
                'reason' => $exception->getMessage(),
            ]);
        }

        return $this->zibal->initiate($amount, $callbackUrl, $metadata);
    }

    public function verify(WalletTransactionPayment $payment, array $payload = []): PaymentVerificationResult
    {
        return $this->gateway(PaymentGatewayEnum::from($payment->gateway))->verify($payment, $payload);
    }

    private function gateway(PaymentGatewayEnum $gateway): PaymentGateway
    {
        return match ($gateway) {
            PaymentGatewayEnum::Sep => $this->sep,
            PaymentGatewayEnum::Zibal => $this->zibal,
            PaymentGatewayEnum::SnappPay => $this->snappPay,
            default => throw new InvalidArgumentException('Unsupported gateway.'),
        };
    }
}
