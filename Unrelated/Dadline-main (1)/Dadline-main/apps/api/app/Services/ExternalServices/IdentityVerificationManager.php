<?php

namespace App\Services\ExternalServices;

use App\Services\ExternalServices\Contracts\IdentityVerificationProvider;
use App\Services\ExternalServices\Data\ExternalVerificationResult;
use App\Services\ExternalServices\Exceptions\ExternalServiceException;

class IdentityVerificationManager
{
    /**
     * @param  array<int, IdentityVerificationProvider>  $providers
     */
    public function __construct(
        private readonly array $providers,
    ) {}

    public function verifyLevelOne(
        string $nationalCode,
        string $mobile,
        ?int $userId = null,
    ): ExternalVerificationResult {
        return $this->run(
            service: 'identity.level_one',
            callback: fn (IdentityVerificationProvider $provider): ExternalVerificationResult => $provider->verifyLevelOne(
                $nationalCode,
                $mobile,
                $userId,
            ),
        );
    }

    public function verifyLevelTwo(
        string $nationalCode,
        string $birthDate,
        ?int $userId = null,
    ): ExternalVerificationResult {
        return $this->run(
            service: 'identity.level_two',
            callback: fn (IdentityVerificationProvider $provider): ExternalVerificationResult => $provider->verifyLevelTwo(
                $nationalCode,
                $birthDate,
                $userId,
            ),
        );
    }

    /**
     * @param  callable(IdentityVerificationProvider): ExternalVerificationResult  $callback
     */
    private function run(string $service, callable $callback): ExternalVerificationResult
    {
        $lastException = null;
        $availableProviders = array_values(array_filter(
            $this->providers,
            fn (IdentityVerificationProvider $provider): bool => $provider->available(),
        ));

        foreach ($availableProviders as $provider) {
            try {
                return $callback($provider);
            } catch (ExternalServiceException $exception) {
                // Any exception here represents a technical/provider failure.
                // Definitive business mismatches are returned as normal results,
                // so the next configured provider may safely be attempted.
                $lastException = $exception;
            }
        }

        throw $lastException ?? new ExternalServiceException(
            message: 'هیچ سرویس فعالی برای استعلام هویت تنظیم نشده است.',
            provider: 'identity',
            service: $service,
            errorCode: 'provider_unavailable',
            retryable: false,
        );
    }
}
