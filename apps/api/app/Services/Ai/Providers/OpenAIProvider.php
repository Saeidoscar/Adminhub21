<?php

namespace App\Services\Ai\Providers;

class OpenAIProvider implements AIProviderInterface
{
    public function __construct(private readonly \GuzzleHttp\Client $httpClient, private readonly string $apiKey) {}

    public function chat(array $messages, array $options = []): array
    {
        $response = $this->httpClient->post('https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => array_merge([
                'model' => 'gpt-4o-mini',
                'messages' => $messages,
            ], $options),
        ]);

        $data = json_decode($response->getBody()->getContents(), true);

        return [
            'content' => $data['choices'][0]['message']['content'] ?? '',
            'usage' => [
                'prompt_tokens' => $data['usage']['prompt_tokens'] ?? 0,
                'completion_tokens' => $data['usage']['completion_tokens'] ?? 0,
            ],
            'provider' => 'openai',
            'model_code' => $data['model'] ?? 'gpt-4o-mini',
        ];
    }

    public function analyze(string $text, array $options = []): array
    {
        return $this->chat([
            ['role' => 'system', 'content' => 'You are a helpful assistant. Analyze the following text and provide insights.'],
            ['role' => 'user', 'content' => $text],
        ], $options);
    }
}
