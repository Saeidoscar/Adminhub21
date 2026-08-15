<?php

namespace App\Services\Identity\Data;

use App\Models\UserVerification;
use App\Services\ExternalServices\Data\ExternalVerificationResult;

final class UserVerificationAttempt
{
    public function __construct(
        public readonly bool $matched,
        public readonly string $message,
        public readonly ExternalVerificationResult $externalResult,
        public readonly ?UserVerification $verification = null,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'matched' => $this->matched,
            'message' => $this->message,
            'provider' => $this->externalResult->provider,
            'service' => $this->externalResult->service,
            'providerCode' => $this->externalResult->code,
            'providerMessage' => $this->externalResult->message,
            'externalRequestId' => $this->externalResult->requestId,
            'externalRequestUuid' => $this->externalResult->requestUuid,
        ];
    }
}
