<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EditorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name_en' => fake()->name(),
            'name_fa' => fake()->name(),
            'photo' => fake()->imageUrl(),
            'specialty' => fake()->randomElement(['video', 'audio', 'design']),
            'rating' => fake()->randomFloat(1, 0, 5),
            'reviews' => fake()->numberBetween(0, 500),
            'projects' => fake()->numberBetween(0, 200),
            'delivery' => fake()->randomElement(['24h', '3 days', '1 week']),
            'rate_toman' => fake()->numberBetween(500000, 10000000),
            'rate_usd' => fake()->numberBetween(50, 2000),
            'bio_en' => fake()->sentence(),
            'bio_fa' => fake()->sentence(),
            'active' => true,
        ];
    }
}
