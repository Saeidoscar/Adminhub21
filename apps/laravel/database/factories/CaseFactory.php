<?php

namespace Database\Factories;

use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CaseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'admin_id' => AdminProfile::factory(),
            'employer_id' => User::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'urgent']),
            'status' => fake()->randomElement(['open', 'in_progress', 'review', 'closed']),
            'tags' => fake()->words(3, true),
        ];
    }
}
