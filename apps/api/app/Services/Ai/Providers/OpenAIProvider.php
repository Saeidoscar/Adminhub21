<?php

namespace App\Services\Ai\Providers;

use GuzzleHttp\Client;

/**
 * OpenAI direct. Compliance-grade route: this is the default for anything that
 * carries contract text, identity documents or payment data.
 */
class OpenAIProvider extends OpenAICompatibleProvider
{
    public function __construct(Client $httpClient, string $apiKey)
    {
        parent::__construct(
            httpClient: $httpClient,
            apiKey: $apiKey,
            baseUrl: 'https://api.openai.com/v1',
            defaultModel: 'gpt-4o-mini',
            providerName: 'openai',
        );
    }
}
