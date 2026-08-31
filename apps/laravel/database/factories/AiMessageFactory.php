<?php

namespace Database\Factories;

use App\Models\AiConversation;
use Illuminate\Database\Eloquent\Factories\Factory;

class AiMessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'conversation_id' => AiConversation::factory(),
            'role' => fake()->randomElement(['user', 'assistant']),
            'content' => fake()->paragraph(),
            'provider' => fake()->randomElement(['openai', 'anthropic']),
            'model_code' => fake()->bothify('???-###'),
            'prompt_tokens' => fake()->numberBetween(10, 2000),
            'completion_tokens' => fake()->numberBetween(10, 2000),
            'total_tokens' => fake()->numberBetween(20, 4000),
            'input_cost' => fake()->randomFloat(4, 0, 0.01),
            'output_cost' => fake()->randomFloat(4, 0, 0.03),
            'total_cost' => fake()->randomFloat(4, 0, 0.04),
            'response_time_ms' => fake()->numberBetween(100, 5000),
        ];
    }
}
