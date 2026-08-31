<?php

namespace Database\Factories;

use App\Models\AiModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AiConversationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(),
            'model_id' => AiModel::factory(),
        ];
    }
}
