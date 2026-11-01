<?php

namespace App\Services\Ai\Providers;

use App\Exceptions\Ai\AiProviderException;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;

/**
 * Shared implementation for every provider that speaks the OpenAI Chat
 * Completions dialect (`POST {base}/chat/completions` with a bearer token).
 *
 * OpenAI, OpenRouter and LayerCloud all use it; each concrete class only
 * supplies the base URL, default model and provider label. Subclasses may
 * override `preparePayload()` (LayerCloud clamps output tokens there) or
 * `chat()` (LayerCloud inserts its training-circle guard rails).
 */
class OpenAICompatibleProvider implements AIProviderInterface
{
    /**
     * Request options that are forwarded verbatim to the upstream API.
     */
    protected const PASS_THROUGH_OPTIONS = [
        'temperature',
        'top_p',
        'max_tokens',
        'max_completion_tokens',
        'stop',
        'response_format',
        'tools',
        'tool_choice',
        'reasoning_effort',
    ];

    /**
     * @param array<string, string> $extraHeaders
     */
    public function __construct(
        protected readonly Client $httpClient,
        protected readonly string $apiKey,
        protected readonly string $baseUrl,
        protected readonly string $defaultModel,
        protected readonly string $providerName,
        protected readonly array $extraHeaders = [],
    ) {}

    public function chat(array $messages, array $options = []): array
    {
        if ($this->apiKey === '') {
            throw AiProviderException::notConfigured($this->providerName);
        }

        $model = (string) ($options['model'] ?? $this->defaultModel);

        try {
            $response = $this->httpClient->post($this->endpoint(), [
                'headers' => $this->headers(),
                'json' => $this->preparePayload($messages, $options, $model),
            ]);
        } catch (RequestException $exception) {
            $response = $exception->getResponse();

            throw AiProviderException::upstream(
                $this->providerName,
                $response === null ? 0 : $response->getStatusCode(),
                $response === null ? $exception->getMessage() : (string) $response->getBody(),
            );
        } catch (GuzzleException $exception) {
            throw AiProviderException::transport($this->providerName, $exception);
        }

        $raw = (string) $response->getBody();
        $data = json_decode($raw, true);

        if (! is_array($data)) {
            throw AiProviderException::upstream($this->providerName, $response->getStatusCode(), $raw);
        }

        return [
            'content' => $this->extractContent($data),
            'usage' => [
                'prompt_tokens' => (int) ($data['usage']['prompt_tokens'] ?? $data['usage']['input_tokens'] ?? 0),
                'completion_tokens' => (int) ($data['usage']['completion_tokens'] ?? $data['usage']['output_tokens'] ?? 0),
            ],
            'provider' => $this->providerName,
            'model_code' => (string) ($data['model'] ?? $model),
        ];
    }

    public function analyze(string $text, array $options = []): array
    {
        return $this->chat([
            ['role' => 'system', 'content' => 'You are a helpful assistant. Analyze the following text and provide insights.'],
            ['role' => 'user', 'content' => $text],
        ], $options);
    }

    /**
     * Cost of one call in USD, from the per-1M-token prices in config.
     * Returns null when the model has no published price so callers can show
     * "unknown" instead of a silently wrong number.
     */
    public function estimateCost(string $model, int $inputTokens, int $outputTokens): ?float
    {
        return null;
    }

    protected function endpoint(): string
    {
        return rtrim($this->baseUrl, '/') . '/chat/completions';
    }

    /**
     * @return array<string, string>
     */
    protected function headers(): array
    {
        return array_merge([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ], $this->extraHeaders);
    }

    /**
     * @param array<int, array<string, mixed>> $messages
     * @param array<string, mixed>             $options
     *
     * @return array<string, mixed>
     */
    protected function preparePayload(array $messages, array $options, string $model): array
    {
        $payload = [
            'model' => $model,
            'messages' => $messages,
            // The repo never streams (the queue job and the controller both
            // await the full body), so ask for a single JSON response.
            'stream' => false,
        ];

        foreach (self::PASS_THROUGH_OPTIONS as $key) {
            if (array_key_exists($key, $options)) {
                $payload[$key] = $options[$key];
            }
        }

        return $payload;
    }

    /**
     * @param array<string, mixed> $data
     */
    protected function extractContent(array $data): string
    {
        $content = $data['choices'][0]['message']['content'] ?? '';

        // Reasoning models may return content as a list of parts.
        if (is_array($content)) {
            $content = implode('', array_map(
                static fn ($part): string => is_array($part) ? (string) ($part['text'] ?? '') : (string) $part,
                $content,
            ));
        }

        return (string) $content;
    }
}
