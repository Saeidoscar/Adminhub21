<?php

namespace App\Services\ExternalServices\Exceptions;

use RuntimeException;

class ExternalServiceException extends RuntimeException
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function __construct(
        string $message,
        public readonly string $provider,
        public readonly string $service,
        public readonly ?string $errorCode = null,
        public readonly bool $retryable = true,
        public readonly array $context = [],
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}
