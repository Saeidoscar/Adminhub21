<?php

namespace Database\Factories;

use App\Models\Editor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class EditorFactory extends Factory
{
    protected $model = Editor::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'name_en' => fake()->name(),
            'name_fa' => fake()->name(),
            'photo' => fake()->randomElement([
                'photo-1494790108377-be9c29b29330',
                'photo-1500648767791-00dcc994a43e',
                'photo-1438761681033-6461ffad8d80',
                'photo-1507003211169-0a1dd7228f2d',
            ]),
            'specialty' => fake()->randomElement(['video', 'photo', 'motion', 'thumbnail']),
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
