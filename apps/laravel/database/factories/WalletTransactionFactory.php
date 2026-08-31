<?php

namespace Database\Factories;

use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

class WalletTransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'wallet_id' => Wallet::factory(),
            'type' => fake()->randomElement(['deposit', 'withdraw', 'transfer', 'payout', 'payment']),
            'amount_toman' => fake()->numberBetween(10000, 5000000),
            'amount_usd' => fake()->numberBetween(10, 5000),
            'currency' => fake()->randomElement(['IRR', 'USD']),
            'status' => fake()->randomElement(['pending', 'completed', 'failed', 'cancelled']),
            'reference_id' => fake()->uuid(),
            'note' => fake()->sentence(),
        ];
    }
}
