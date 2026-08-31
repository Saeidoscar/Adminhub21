<?php

namespace Database\Factories;

use App\Models\SupportCase;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TimeLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'case_id' => SupportCase::factory(),
            'task_id' => Task::factory(),
            'description' => fake()->sentence(),
            'started_at' => fake()->dateTime(),
            'ended_at' => fake()->dateTime(),
            'duration_minutes' => fake()->numberBetween(15, 480),
        ];
    }
}
