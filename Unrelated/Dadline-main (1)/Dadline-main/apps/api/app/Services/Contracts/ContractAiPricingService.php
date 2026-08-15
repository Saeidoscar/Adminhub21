<?php

namespace App\Services\Contracts;

use App\Models\Option;

class ContractAiPricingService
{
    public function quote(): array
    {
        return [
            'analysis_amount' => $this->price('ai_analysis_price'),
            'rewrite_amount' => $this->price('ai_rewrite_price'),
            'currency' => 'IRT',
            'currency_label' => 'تومان',
        ];
    }

    private function price(string $key): int
    {
        $value = Option::get($key, 0);

        return is_numeric($value) ? max(0, (int) $value) : 0;
    }
}
