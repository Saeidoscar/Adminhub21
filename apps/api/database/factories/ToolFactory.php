<?php

namespace Database\Factories;

use App\Models\Tool;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ToolFactory extends Factory
{
    protected $model = Tool::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'name' => fake()->words(2, true),
            'category' => fake()->randomElement(['automation', 'analytics', 'design', 'ecommerce']),
            'icon' => fake()->randomElement(['settings', 'send', 'chart', 'layers']),
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
