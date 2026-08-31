<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class VibeCoderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name_en' => fake()->name(),
            'name_fa' => fake()->name(),
            'photo' => fake()->imageUrl(),
            'stack' => fake()->randomElement(['react', 'vue', 'svelte', 'nextjs']),
            'rating' => fake()->randomFloat(1, 0, 5),
            'reviews' => fake()->numberBetween(0, 500),
            'projects' => fake()->numberBetween(0, 200),
            'rate_toman' => fake()->numberBetween(500000, 10000000),
            'rate_usd' => fake()->numberBetween(50, 2000),
            'delivery' => fake()->randomElement(['24h', '3 days', '1 week']),
            'bio_en' => fake()->sentence(),
            'bio_fa' => fake()->sentence(),
            'active' => true,
        ];
    }
}
