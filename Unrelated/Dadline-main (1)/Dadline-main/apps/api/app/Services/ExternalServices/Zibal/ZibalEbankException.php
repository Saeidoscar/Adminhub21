<?php

namespace App\Services\ExternalServices\Zibal;

use RuntimeException;
use Throwable;

class ZibalEbankException extends RuntimeException
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        string $message,
        public readonly bool $retryable = true,
        public readonly ?int $resultCode = null,
        public readonly array $payload = [],
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}
