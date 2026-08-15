<?php

namespace App\Services\ExternalServices\Contracts;

use App\Services\ExternalServices\Data\ExternalVerificationResult;

interface IdentityVerificationProvider
{
    public function name(): string;

    public function available(): bool;

    public function verifyLevelOne(
        string $nationalCode,
        string $mobile,
        ?int $userId = null,
    ): ExternalVerificationResult;

    public function verifyLevelTwo(
        string $nationalCode,
        string $birthDate,
        ?int $userId = null,
    ): ExternalVerificationResult;
}
