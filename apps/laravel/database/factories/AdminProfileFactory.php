<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdminProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'photo' => fake()->imageUrl(),
            'rating' => fake()->randomFloat(1, 0, 5),
            'reviews' => fake()->numberBetween(0, 500),
            'verified' => fake()->boolean(30),
            'insured' => fake()->boolean(20),
            'monthly_toman' => fake()->numberBetween(0, 50000000),
            'monthly_usd' => fake()->numberBetween(0, 5000),
            'bio_en' => fake()->sentence(),
            'bio_fa' => fake()->sentence(),
            'skills_en' => fake()->words(5, true),
            'skills_fa' => fake()->words(5, true),
            'platforms' => ['github', 'gitlab'],
        ];
    }
}
