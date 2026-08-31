<?php

namespace Database\Factories;

use App\Models\AdminProfile;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomOfferFactory extends Factory
{
    public function definition(): array
    {
        return [
            'package_id' => Package::factory(),
            'admin_id' => AdminProfile::factory(),
            'employer_id' => User::factory(),
            'employer_name' => fake()->name(),
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'platforms' => fake()->randomElements(['github', 'gitlab'], 2),
            'platform_configs' => [],
            'proposed_price_toman' => fake()->numberBetween(100000, 50000000),
            'proposed_price_usd' => fake()->numberBetween(50, 5000),
            'billing_cycle' => fake()->randomElement(['monthly', 'project', 'hourly']),
            'delivery_time' => fake()->randomElement(['1 week', '2 weeks', '1 month']),
            'start_date' => fake()->date(),
            'end_date' => fake()->date(),
            'message' => fake()->sentence(),
        ];
    }
}
