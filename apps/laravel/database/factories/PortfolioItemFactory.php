<?php

namespace Database\Factories;

use App\Models\AdminProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class PortfolioItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'admin_id' => AdminProfile::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'media_url' => fake()->imageUrl(),
            'media_type' => fake()->randomElement(['image', 'video']),
            'tags' => fake()->words(3, true),
        ];
    }
}
