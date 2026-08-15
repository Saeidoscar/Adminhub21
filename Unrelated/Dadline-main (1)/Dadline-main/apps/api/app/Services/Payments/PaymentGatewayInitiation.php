<?php

namespace App\Services\Payments;

class PaymentGatewayInitiation
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly string $gateway,
        public readonly string $paymentUrl,
        public readonly ?string $token = null,
        public readonly ?string $authority = null,
        public readonly ?string $refNum = null,
        public readonly ?string $terminalId = null,
        public readonly bool $cardOwnerVerificationEnforced = false,
        public readonly ?string $cardOwnerVerificationMethod = null,
        public readonly array $payload = []
    ) {}
}
