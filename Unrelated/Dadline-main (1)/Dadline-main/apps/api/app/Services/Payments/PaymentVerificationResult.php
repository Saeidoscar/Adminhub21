<?php

namespace App\Services\Payments;

class PaymentVerificationResult
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly bool $successful,
        public readonly ?string $refNum = null,
        public readonly ?string $rrn = null,
        public readonly ?string $cardNumberMasked = null,
        public readonly int $gatewayFee = 0,
        public readonly ?int $verifiedAmountRial = null,
        public readonly ?string $terminalId = null,
        public readonly ?int $resultCode = null,
        public readonly ?string $resultMessage = null,
        public readonly bool $ownershipChecked = false,
        public readonly ?string $ownershipMethod = null,
        public readonly ?string $failureReason = null,
        public readonly array $payload = []
    ) {}
}
