<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class WalletFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'balance_toman' => fake()->numberBetween(0, 10000000),
            'balance_usd' => fake()->numberBetween(0, 10000),
            'currency' => 'IRR',
        ];
    }
}
