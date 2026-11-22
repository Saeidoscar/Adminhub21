<?php

namespace App\Services\Ai;

use App\Services\Ai\Providers\AIProviderInterface;
use App\Services\Ai\Providers\AnthropicProvider;
use App\Services\Ai\Providers\ArvanCloudProvider;
use App\Services\Ai\Providers\AvalAiProvider;
use App\Services\Ai\Providers\LayerCloudProvider;
use App\Services\Ai\Providers\OpenAIProvider;
use App\Services\Ai\Providers\OpenRouterProvider;
use InvalidArgumentException;

class AIProviderFactory
{
    /**
     * Every routable provider name. `arvancloud` and `avalai` are the
     * Toman-billed gateways; `layercloud` is the training-circle route and
     * refuses to run in production while `LAYERCLOUD_TRIAL_ONLY` is true.
     */
    public const PROVIDERS = ['arvancloud', 'avalai', 'openai', 'anthropic', 'openrouter', 'layercloud'];

    public function make(string $provider): AIProviderInterface
    {
        $provider = strtolower(trim($provider));

        return match ($provider) {
            'arvancloud' => new ArvanCloudProvider(
                app('guzzle'),
                (string) config('services.arvancloud.api_key'),
                (string) config('services.arvancloud.base_url'),
            ),
            'avalai' => new AvalAiProvider(
                app('guzzle'),
                (string) config('services.avalai.api_key'),
                (string) config('services.avalai.base_url'),
            ),
            'openai' => new OpenAIProvider(app('guzzle'), (string) config('services.openai.api_key')),
            'anthropic' => new AnthropicProvider(app('guzzle'), (string) config('services.anthropic.api_key')),
            'openrouter' => new OpenRouterProvider(app('guzzle'), (string) config('services.openrouter.api_key')),
            'layercloud' => new LayerCloudProvider(app('guzzle'), (string) config('services.layercloud.api_key')),
            default => throw new InvalidArgumentException("Unsupported AI provider: {$provider}"),
        };
    }

    /**
     * Provider names accepted by the API layer, e.g. `Rule::in(AIProviderFactory::PROVIDERS)`.
     *
     * @return array<int, string>
     */
    public static function supported(): array
    {
        return self::PROVIDERS;
    }
}
