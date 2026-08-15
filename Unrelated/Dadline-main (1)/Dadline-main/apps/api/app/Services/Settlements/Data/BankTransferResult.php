<?php

namespace App\Services\Settlements\Data;

final readonly class BankTransferResult
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public int $status,
        public ?string $trackerId,
        public ?string $receiptLink,
        public array $payload,
    ) {}
}
