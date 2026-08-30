<?php

namespace App\Services\Ai\Providers;

class AnthropicProvider implements AIProviderInterface
{
    public function __construct(private readonly \GuzzleHttp\Client $httpClient, private readonly string $apiKey) {}

    public function chat(array $messages, array $options = []): array
    {
        $systemMessage = '';
        $filteredMessages = [];
        foreach ($messages as $message) {
            if ($message['role'] === 'system') {
                $systemMessage = $message['content'];
            } else {
                $filteredMessages[] = $message;
            }
        }

        $response = $this->httpClient->post('https://api.anthropic.com/v1/messages', [
            'headers' => [
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ],
            'json' => array_merge([
                'model' => 'claude-3-5-haiku-20241022',
                'max_tokens' => 1024,
                'system' => $systemMessage,
                'messages' => $filteredMessages,
            ], $options),
        ]);

        $data = json_decode($response->getBody()->getContents(), true);

        return [
            'content' => $data['content'][0]['text'] ?? '',
            'usage' => [
                'prompt_tokens' => $data['usage']['input_tokens'] ?? 0,
                'completion_tokens' => $data['usage']['output_tokens'] ?? 0,
            ],
            'provider' => 'anthropic',
            'model_code' => $data['model'] ?? 'claude-3-5-haiku-20241022',
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
