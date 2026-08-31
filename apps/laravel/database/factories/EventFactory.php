<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'start_at' => fake()->dateTime(),
            'end_at' => fake()->dateTime(),
            'all_day' => fake()->boolean(20),
            'color' => fake()->hexColor(),
        ];
    }
}
