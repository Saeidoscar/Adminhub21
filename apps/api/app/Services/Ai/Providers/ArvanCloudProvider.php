<?php

namespace App\Services\Ai\Providers;

use GuzzleHttp\Client;

/**
 * ArvanCloud AIaaS Gateway (https://docs.arvancloud.ir/fa/aiaas/).
 *
 * Speaks the OpenAI Chat Completions dialect (`POST {base}/chat/completions`),
 * bills pay-as-you-go in Toman from your ArvanCloud wallet, and authenticates
 * with `Authorization: apikey <key>` against your configured gateway URL.
 */
class ArvanCloudProvider extends OpenAICompatibleProvider
{
    public function __construct(Client $httpClient, string $apiKey, ?string $baseUrl = null)
    {
        parent::__construct(
            httpClient: $httpClient,
            apiKey: $apiKey,
            baseUrl: $baseUrl ?? (string) config('services.arvancloud.base_url', 'https://arvancloudai.ir/v1'),
            defaultModel: (string) config('services.arvancloud.default_model', 'gpt-5-mini'),
            providerName: 'arvancloud',
        );
    }

    /**
     * ArvanCloud AIaaS expects `Authorization: apikey <token>` rather than
     * `Bearer <token>`. Accept keys provided either raw or pre-prefixed.
     *
     * @return array<string, string>
     */
    protected function headers(): array
    {
        $key = trim($this->apiKey);
        $authValue = str_starts_with(strtolower($key), 'apikey ')
            ? $key
            : 'apikey ' . $key;

        return array_merge([
            'Authorization' => $authValue,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ], $this->extraHeaders);
    }
}
