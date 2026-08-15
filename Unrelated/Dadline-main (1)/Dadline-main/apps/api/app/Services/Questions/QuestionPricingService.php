<?php

namespace App\Services\Questions;

use App\Models\Option;
use Illuminate\Validation\ValidationException;

class QuestionPricingService
{
    public const PRIVATE_SURCHARGE_PERCENT = 30;

    public function basePrice(): int
    {
        return $this->positiveOption('submit_question');
    }

    public function price(bool $isPrivate): int
    {
        $basePrice = $this->basePrice();

        if (! $isPrivate) {
            return $basePrice;
        }

        return $basePrice + (int) ceil($basePrice * self::PRIVATE_SURCHARGE_PERCENT / 100);
    }

    public function firstAnswerReward(): int
    {
        return $this->positiveOption('first_answer_on_question_cost');
    }

    /** @return array<string, int> */
    public function payload(): array
    {
        return [
            'publicPrice' => $this->price(false),
            'privatePrice' => $this->price(true),
            'privateSurchargePercent' => self::PRIVATE_SURCHARGE_PERCENT,
        ];
    }

    private function positiveOption(string $key): int
    {
        $value = Option::get($key);
        $amount = is_numeric($value) ? (int) $value : 0;

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'pricing' => 'هزینه این خدمت در تنظیمات سامانه معتبر نیست.',
            ]);
        }

        return $amount;
    }
}
