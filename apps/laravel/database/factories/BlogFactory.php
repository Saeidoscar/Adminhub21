<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BlogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'author_id' => User::factory(),
            'title' => fake()->sentence(),
            'content' => fake()->paragraphs(5, true),
            'cover_url' => fake()->imageUrl(),
            'status' => fake()->randomElement(['draft', 'published']),
            'published_at' => fake()->date(),
            'views' => fake()->numberBetween(0, 50000),
        ];
    }
}
