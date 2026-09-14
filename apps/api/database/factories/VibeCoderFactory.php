<?php

namespace Database\Factories;

use App\Models\VibeCoder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class VibeCoderFactory extends Factory
{
    protected $model = VibeCoder::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'name_en' => fake()->name(),
            'name_fa' => fake()->name(),
            'photo' => fake()->randomElement([
                'photo-1506794778202-cad84cf45f1d',
                'photo-1534528741775-53994a69daeb',
                'photo-1507003211169-0a1dd7228f2d',
                'photo-1544005313-94ddf0286df2',
            ]),
            'stack' => fake()->randomElement(['webApp', 'automation', 'bots', 'landing', 'frontend']),
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
