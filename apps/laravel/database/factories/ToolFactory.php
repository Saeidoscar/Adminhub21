<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ToolFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'category' => fake()->randomElement(['development', 'design', 'marketing']),
            'icon' => fake()->imageUrl(),
            'rating' => fake()->randomFloat(1, 0, 5),
            'reviews' => fake()->numberBetween(0, 1000),
            'popular' => fake()->boolean(30),
            'price_toman' => fake()->numberBetween(100000, 5000000),
            'price_usd' => fake()->numberBetween(10, 500),
            'desc_en' => fake()->sentence(),
            'desc_fa' => fake()->sentence(),
            'active' => true,
        ];
    }
}
