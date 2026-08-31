<?php

namespace Database\Factories;

use App\Models\AdminProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class PackageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'admin_id' => AdminProfile::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'type' => fake()->randomElement(['platform', 'bundle']),
            'platforms' => fake()->randomElements(['github', 'gitlab', 'vercel', 'aws'], 2),
            'platform_configs' => [],
            'price_toman' => fake()->numberBetween(100000, 50000000),
            'price_usd' => fake()->numberBetween(50, 5000),
            'billing_cycle' => fake()->randomElement(['monthly', 'project', 'hourly']),
            'delivery_time' => fake()->randomElement(['1 week', '2 weeks', '1 month']),
            'featured' => fake()->boolean(20),
            'active' => true,
        ];
    }
}
