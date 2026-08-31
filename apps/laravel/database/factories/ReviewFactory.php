<?php

namespace Database\Factories;

use App\Models\AdminProfile;
use App\Models\Contract;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'admin_id' => AdminProfile::factory(),
            'employer_id' => User::factory(),
            'contract_id' => Contract::factory(),
            'rating' => fake()->numberBetween(1, 5),
            'comment' => fake()->sentence(),
        ];
    }
}
