<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AiModelFactory extends Factory
{
    public function definition(): array
    {
        return [
            'provider' => fake()->randomElement(['openai', 'anthropic', 'google']),
            'code' => fake()->bothify('???-###'),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'input_cost' => fake()->randomFloat(4, 0, 0.01),
            'output_cost' => fake()->randomFloat(4, 0, 0.03),
            'context_window' => fake()->numberBetween(4000, 128000),
            'api_base_url' => fake()->url(),
            'default_temperature' => fake()->randomFloat(1, 0, 1),
            'max_output_tokens' => fake()->numberBetween(256, 4096),
            'supports_streaming' => fake()->boolean(80),
            'supports_vision' => fake()->boolean(30),
            'is_active' => true,
        ];
    }
}
