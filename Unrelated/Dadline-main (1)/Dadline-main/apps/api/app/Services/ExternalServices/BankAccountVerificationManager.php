<?php

namespace App\Services\ExternalServices;

use App\Services\ExternalServices\Contracts\BankAccountVerificationProvider;
use App\Services\ExternalServices\Data\ExternalVerificationResult;
use App\Services\ExternalServices\Exceptions\ExternalServiceException;

class BankAccountVerificationManager
{
    /**
     * @param  array<int, BankAccountVerificationProvider>  $providers
     */
    public function __construct(
        private readonly array $providers,
    ) {}

    public function verifyIbanOwnership(
        string $nationalCode,
        string $birthDate,
        string $iban,
        ?int $userId = null,
    ): ExternalVerificationResult {
        $lastException = null;
        $availableProviders = array_values(array_filter(
            $this->providers,
            fn (BankAccountVerificationProvider $provider): bool => $provider->available(),
        ));

        foreach ($availableProviders as $provider) {
            try {
                return $provider->verifyIbanOwnership(
                    $nationalCode,
                    $birthDate,
                    $iban,
                    $userId,
                );
            } catch (ExternalServiceException $exception) {
                // Any exception here represents a technical/provider failure.
                // Definitive business mismatches are returned as normal results,
                // so the next configured provider may safely be attempted.
                $lastException = $exception;
            }
        }

        throw $lastException ?? new ExternalServiceException(
            message: 'هیچ سرویس فعالی برای تطبیق شماره شبا تنظیم نشده است.',
            provider: 'bank',
            service: 'bank.iban_match',
            errorCode: 'provider_unavailable',
            retryable: false,
        );
    }
}
