<?php

namespace App\Services\Purchases;

class PlatformRevenueBreakdown
{
    public function __construct(
        public readonly int $grossCommission,
        public readonly int $netIncome,
        public readonly int $vatAmount,
        public readonly int $vendorShare,
        public readonly float $platformRate,
        public readonly float $vatRate
    ) {}
}
