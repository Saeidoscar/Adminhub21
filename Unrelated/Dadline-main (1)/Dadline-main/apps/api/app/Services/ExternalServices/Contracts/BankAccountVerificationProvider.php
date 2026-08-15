<?php

namespace App\Services\ExternalServices\Contracts;

use App\Services\ExternalServices\Data\ExternalVerificationResult;

interface BankAccountVerificationProvider
{
    public function name(): string;

    public function available(): bool;

    public function verifyIbanOwnership(
        string $nationalCode,
        string $birthDate,
        string $iban,
        ?int $userId = null,
    ): ExternalVerificationResult;
}
