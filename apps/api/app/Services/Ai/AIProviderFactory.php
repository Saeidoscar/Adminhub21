<?php

namespace App\Services\Ai;

use App\Services\Ai\Providers\AIProviderInterface;
use App\Services\Ai\Providers\AnthropicProvider;
use App\Services\Ai\Providers\OpenAIProvider;
use App\Services\Ai\Providers\OpenRouterProvider;

class AIProviderFactory
{
    public function make(string $provider): AIProviderInterface
    {
        return match (strtolower($provider)) {
            'openai' => new OpenAIProvider(app('guzzle'), (string) config('services.openai.api_key')),
            'anthropic' => new AnthropicProvider(app('guzzle'), (string) config('services.anthropic.api_key')),
            'openrouter' => new OpenRouterProvider(app('guzzle'), (string) config('services.openrouter.api_key')),
            default => throw new \InvalidArgumentException("Unsupported AI provider: {$provider}"),
        };
    }
}
