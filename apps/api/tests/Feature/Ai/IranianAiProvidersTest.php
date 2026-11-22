<?php

namespace Tests\Feature\Ai;

use App\Exceptions\Ai\AiProviderException;
use App\Services\Ai\AIProviderFactory;
use App\Services\Ai\Providers\ArvanCloudProvider;
use App\Services\Ai\Providers\AvalAiProvider;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use Psr\Http\Message\RequestInterface;
use Tests\TestCase;

class IranianAiProvidersTest extends TestCase
{
    private ?RequestInterface $lastRequest = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->lastRequest = null;
    }

    public function test_arvancloud_uses_apikey_authorization_header_and_custom_base_url(): void
    {
        $client = $this->mockClient(new Response(200, [], $this->completionBody('gpt-5-mini', 'Salam from ArvanCloud')));

        $provider = new ArvanCloudProvider(
            httpClient: $client,
            apiKey: 'arvan_secret_key',
            baseUrl: 'https://my-gw.arvancloudai.ir/v1',
        );

        $result = $provider->chat([
            ['role' => 'user', 'content' => 'Hello'],
        ]);

        $this->assertSame('arvancloud', $result['provider']);
        $this->assertSame('gpt-5-mini', $result['model_code']);
        $this->assertSame('Salam from ArvanCloud', $result['content']);
        $this->assertSame(100, $result['usage']['prompt_tokens']);
        $this->assertSame(50, $result['usage']['completion_tokens']);

        $this->assertNotNull($this->lastRequest);
        $this->assertSame('https://my-gw.arvancloudai.ir/v1/chat/completions', (string) $this->lastRequest->getUri());
        $this->assertSame('apikey arvan_secret_key', $this->lastRequest->getHeaderLine('Authorization'));
    }

    public function test_arvancloud_does_not_double_prefix_apikey_header(): void
    {
        $client = $this->mockClient(new Response(200, [], $this->completionBody('gpt-5-mini', 'ok')));

        $provider = new ArvanCloudProvider($client, 'apikey already_prefixed');
        $provider->chat([['role' => 'user', 'content' => 'ping']]);

        $this->assertNotNull($this->lastRequest);
        $this->assertSame('apikey already_prefixed', $this->lastRequest->getHeaderLine('Authorization'));
    }

    public function test_arvancloud_throws_not_configured_when_api_key_is_empty(): void
    {
        $client = $this->mockClient(new Response(200, [], $this->completionBody('gpt-5-mini', 'ok')));
        $provider = new ArvanCloudProvider($client, '');

        $this->expectException(AiProviderException::class);
        $this->expectExceptionMessage('is not configured');

        $provider->chat([['role' => 'user', 'content' => 'ping']]);
    }

    public function test_arvancloud_surfaces_upstream_errors_without_leaking_key(): void
    {
        $client = $this->mockClient(new Response(402, [], '{"error":"wallet empty"}'));
        $provider = new ArvanCloudProvider($client, 'arvan_super_secret');

        try {
            $provider->chat([['role' => 'user', 'content' => 'ping']]);
            $this->fail('Expected AiProviderException.');
        } catch (AiProviderException $exception) {
            $this->assertStringContainsString('HTTP 402', $exception->getMessage());
            $this->assertStringNotContainsString('arvan_super_secret', $exception->getMessage());
        }
    }

    public function test_avalai_uses_bearer_auth_and_avalai_endpoint(): void
    {
        $client = $this->mockClient(new Response(200, [], $this->completionBody('deepseek-v4.1-flash', 'Salam from AvalAI')));

        $provider = new AvalAiProvider($client, 'aval_secret_key');
        $result = $provider->chat([['role' => 'user', 'content' => 'Translate this']], [
            'model' => 'deepseek-v4.1-flash',
        ]);

        $this->assertSame('avalai', $result['provider']);
        $this->assertSame('deepseek-v4.1-flash', $result['model_code']);
        $this->assertSame('Salam from AvalAI', $result['content']);

        $this->assertNotNull($this->lastRequest);
        $this->assertSame('https://api.avalai.ir/v1/chat/completions', (string) $this->lastRequest->getUri());
        $this->assertSame('Bearer aval_secret_key', $this->lastRequest->getHeaderLine('Authorization'));
    }

    public function test_factory_resolves_arvancloud_and_avalai(): void
    {
        config()->set('services.arvancloud.api_key', 'k1');
        config()->set('services.avalai.api_key', 'k2');

        $factory = app(AIProviderFactory::class);

        $this->assertInstanceOf(ArvanCloudProvider::class, $factory->make('arvancloud'));
        $this->assertInstanceOf(AvalAiProvider::class, $factory->make('avalai'));
        $this->assertContains('arvancloud', AIProviderFactory::supported());
        $this->assertContains('avalai', AIProviderFactory::supported());
    }

    private function mockClient(Response $response): Client
    {
        $stack = HandlerStack::create(new MockHandler([$response]));
        $stack->push(Middleware::mapRequest(function (RequestInterface $request): RequestInterface {
            $this->lastRequest = $request;

            return $request;
        }));

        return new Client(['handler' => $stack]);
    }

    private function completionBody(string $model, string $content): string
    {
        return (string) json_encode([
            'id' => 'chatcmpl-test',
            'model' => $model,
            'choices' => [
                ['index' => 0, 'message' => ['role' => 'assistant', 'content' => $content], 'finish_reason' => 'stop'],
            ],
            'usage' => ['prompt_tokens' => 100, 'completion_tokens' => 50, 'total_tokens' => 150],
        ]);
    }
}
