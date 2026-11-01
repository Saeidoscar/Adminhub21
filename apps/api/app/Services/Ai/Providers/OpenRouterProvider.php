<?php

namespace App\Services\Ai\Providers;

use GuzzleHttp\Client;

/**
 * OpenRouter relay. Used as the fallback when a first-choice provider fails;
 * the attribution headers are what OpenRouter shows in its activity console.
 */
class OpenRouterProvider extends OpenAICompatibleProvider
{
    public function __construct(Client $httpClient, string $apiKey)
    {
        parent::__construct(
            httpClient: $httpClient,
            apiKey: $apiKey,
            baseUrl: 'https://openrouter.ai/api/v1',
            defaultModel: 'openai/gpt-4o-mini',
            providerName: 'openrouter',
            extraHeaders: [
                'HTTP-Referer' => (string) config('app.url', 'https://adminhub21.com'),
                'X-Title' => 'AdminHub21',
            ],
        );
    }
}
