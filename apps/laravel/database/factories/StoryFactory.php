<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'author_id' => User::factory(),
            'title' => fake()->sentence(),
            'content' => fake()->paragraphs(3, true),
            'cover_url' => fake()->imageUrl(),
            'status' => fake()->randomElement(['draft', 'published']),
            'views' => fake()->numberBetween(0, 10000),
        ];
    }
}
