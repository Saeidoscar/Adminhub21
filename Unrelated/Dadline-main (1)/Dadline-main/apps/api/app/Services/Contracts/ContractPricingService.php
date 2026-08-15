<?php

namespace App\Services\Contracts;

use App\Models\Contract;
use App\Models\Option;

class ContractPricingService
{
    public function quote(Contract $contract): array
    {
        $basePrice = $this->basePrice();
        $signaturesCount = max(2, $contract->signatures()->count());
        $extraParties = max(0, $signaturesCount - 2);
        $extraAmount = (int) round($basePrice * 0.25 * $extraParties);

        return [
            'base_amount' => $basePrice,
            'included_parties' => 2,
            'parties_count' => $signaturesCount,
            'extra_parties' => $extraParties,
            'extra_party_rate' => 0.25,
            'extra_amount' => $extraAmount,
            'total_amount' => $basePrice + $extraAmount,
            'currency' => 'IRT',
            'currency_label' => 'تومان',
        ];
    }

    public function basePrice(): int
    {
        $value = Option::get('submit_contract', 0);

        return is_numeric($value) ? max(0, (int) $value) : 0;
    }
}
