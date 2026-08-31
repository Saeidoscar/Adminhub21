<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PayoutFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount_toman' => fake()->numberBetween(100000, 10000000),
            'amount_usd' => fake()->numberBetween(50, 5000),
            'currency' => fake()->randomElement(['IRR', 'USD']),
            'method' => fake()->randomElement(['bank_transfer', 'paypal', 'crypto']),
            'account_details' => ['iban' => fake()->iban()],
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'completed']),
            'processed_at' => fake()->date(),
            'processed_by' => User::factory(),
            'note' => fake()->sentence(),
        ];
    }
}
