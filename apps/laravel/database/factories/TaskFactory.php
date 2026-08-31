<?php

namespace Database\Factories;

use App\Models\SupportCase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'case_id' => SupportCase::factory(),
            'assigned_to' => User::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(['todo', 'in_progress', 'done', 'blocked']),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'due_date' => fake()->date(),
        ];
    }
}
