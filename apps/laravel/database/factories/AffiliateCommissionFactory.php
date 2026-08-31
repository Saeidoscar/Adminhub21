<?php

namespace Database\Factories;

use App\Models\AffiliateCode;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AffiliateCommissionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code_id' => AffiliateCode::factory(),
            'referrer_id' => User::factory(),
            'referred_id' => User::factory(),
            'amount_toman' => fake()->numberBetween(10000, 1000000),
            'amount_usd' => fake()->numberBetween(1, 1000),
            'status' => fake()->randomElement(['pending', 'completed']),
            'paid_at' => fake()->date(),
        ];
    }
}
