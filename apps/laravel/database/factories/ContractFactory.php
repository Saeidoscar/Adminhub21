<?php

namespace Database\Factories;

use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContractFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->bothify('???-#####')),
            'employer_id' => User::factory(),
            'admin_id' => AdminProfile::factory(),
            'platform' => fake()->randomElement(['github', 'gitlab', 'vercel']),
            'status' => fake()->randomElement(['active', 'pending', 'completed', 'disputed']),
            'amount_toman' => fake()->numberBetween(100000, 50000000),
            'amount_usd' => fake()->numberBetween(50, 5000),
            'has_insurance' => fake()->boolean(20),
            'has_substitute' => fake()->boolean(10),
            'term_clause' => fake()->sentence(),
            'substitute_clause' => fake()->sentence(),
            'start_date' => fake()->date(),
            'end_date' => fake()->date(),
            'signed_by_employer_at' => fake()->date(),
            'signed_by_admin_at' => fake()->date(),
        ];
    }
}
