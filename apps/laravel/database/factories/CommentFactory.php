<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'post_id' => fake()->uuid(),
            'post_type' => fake()->randomElement(['blog', 'story']),
            'author_id' => User::factory(),
            'parent_id' => null,
            'body' => fake()->paragraph(),
        ];
    }
}
