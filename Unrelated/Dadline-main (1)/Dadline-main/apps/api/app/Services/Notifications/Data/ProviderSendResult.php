<?php

namespace App\Services\Notifications\Data;

class ProviderSendResult
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly bool $successful,
        public readonly string $provider,
        public readonly ?string $messageId = null,
        public readonly ?string $errorCode = null,
        public readonly ?string $errorMessage = null,
        public readonly bool $retryable = true,
        public readonly array $payload = [],
    ) {}

    public static function sent(string $provider, ?string $messageId = null, array $payload = []): self
    {
        return new self(
            successful: true,
            provider: $provider,
            messageId: $messageId,
            retryable: false,
            payload: $payload,
        );
    }

    public static function failed(
        string $provider,
        ?string $errorCode,
        ?string $errorMessage,
        bool $retryable = true,
        array $payload = []
    ): self {
        return new self(
            successful: false,
            provider: $provider,
            errorCode: $errorCode,
            errorMessage: $errorMessage,
            retryable: $retryable,
            payload: $payload,
        );
    }
}
