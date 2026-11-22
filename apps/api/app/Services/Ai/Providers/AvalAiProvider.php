<?php

namespace App\Services\Ai\Providers;

use GuzzleHttp\Client;

/**
 * AvalAI Gateway (https://docs.avalai.ir).
 *
 * OpenAI-compatible router billed in Toman (OpenAI, Anthropic, DeepSeek,
 * xAI Grok and Google models under a single API key). Useful alongside
 * ArvanCloud when a task specifically needs DeepSeek or Grok.
 */
class AvalAiProvider extends OpenAICompatibleProvider
{
    public function __construct(Client $httpClient, string $apiKey, ?string $baseUrl = null)
    {
        parent::__construct(
            httpClient: $httpClient,
            apiKey: $apiKey,
            baseUrl: $baseUrl ?? (string) config('services.avalai.base_url', 'https://api.avalai.ir/v1'),
            defaultModel: (string) config('services.avalai.default_model', 'deepseek-v4.1-flash'),
            providerName: 'avalai',
        );
    }
}
