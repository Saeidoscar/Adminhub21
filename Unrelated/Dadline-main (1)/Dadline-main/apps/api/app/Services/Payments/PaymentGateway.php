<?php

namespace App\Services\Payments;

use App\Models\WalletTransactionPayment;

interface PaymentGateway
{
    public function name(): string;

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function initiate(int $amount, string $callbackUrl, array $metadata = []): PaymentGatewayInitiation;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function verify(WalletTransactionPayment $payment, array $payload = []): PaymentVerificationResult;
}
