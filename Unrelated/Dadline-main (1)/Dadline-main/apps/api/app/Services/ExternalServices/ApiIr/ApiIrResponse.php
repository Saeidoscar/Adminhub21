<?php

namespace App\Services\ExternalServices\ApiIr;

final class ApiIrResponse
{
    /**
     * @param  mixed  $data
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly bool $successful,
        public readonly ?int $code,
        public readonly ?string $message,
        public readonly mixed $data,
        public readonly int $httpStatus,
        public readonly array $payload,
        public readonly int $requestId,
        public readonly string $requestUuid,
        public readonly bool $billable,
    ) {}
}
