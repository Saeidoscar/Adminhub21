<?php

namespace App\Services\ExternalServices\Data;

final class ExternalVerificationResult
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public readonly bool $matched,
        public readonly string $provider,
        public readonly string $service,
        public readonly ?int $code = null,
        public readonly ?string $message = null,
        public readonly array $data = [],
        public readonly ?int $requestId = null,
        public readonly ?string $requestUuid = null,
        public readonly bool $billable = true,
    ) {}
}
