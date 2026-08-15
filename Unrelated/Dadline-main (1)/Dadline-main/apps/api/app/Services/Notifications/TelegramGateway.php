<?php

namespace App\Services\Notifications;

use App\Models\Option;
use App\Services\ExternalServices\OptionServiceSettings;
use App\Services\Notifications\Data\ProviderSendResult;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class TelegramGateway
{
    private const PROVIDER = 'telegram-bot-api';

    private const DEFAULT_API_BASE_URL = 'https://api.telegram.org';

    private const MAX_MESSAGE_LENGTH = 4096;

    /**
     * @var array<int, string>
     */
    private const SUPPORTED_PROXY_SCHEMES = [
        'http',
        'https',
        'socks5',
        'socks5h',
    ];

    /**
     * @var array<int, string>
     */
    private const ALLOWED_SEND_MESSAGE_PARAMETERS = [
        'message_thread_id',
        'direct_messages_topic_id',
        'parse_mode',
        'link_preview_options',
        'disable_notification',
        'protect_content',
        'reply_parameters',
        'reply_markup',
    ];

    public function __construct(
        private readonly OptionServiceSettings $settings,
    ) {}

    /**
     * @param  array<string, mixed>  $parameters
     */
    public function sendToChat(int|string $chatId, string $text, array $parameters = []): ProviderSendResult
    {
        if (! $this->settings->enabled('telegram_bot_enabled')) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'provider_disabled',
                errorMessage: 'درگاه ربات تلگرام غیرفعال است.',
                retryable: false,
            );
        }

        if (blank((string) $chatId)) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'missing_recipient',
                errorMessage: 'شناسه چت یا کانال تلگرام مشخص نیست.',
                retryable: false,
            );
        }

        $text = trim($text);

        if ($text === '') {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'empty_message',
                errorMessage: 'متن پیام تلگرام نمی‌تواند خالی باشد.',
                retryable: false,
            );
        }

        if (mb_strlen($text) > self::MAX_MESSAGE_LENGTH) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'message_too_long',
                errorMessage: 'متن پیام تلگرام نباید بیشتر از ۴۰۹۶ نویسه باشد.',
                retryable: false,
            );
        }

        $configurationFailure = $this->transportConfigurationFailure();

        if ($configurationFailure !== null) {
            return $configurationFailure;
        }

        $routes = $this->transportRoutes();

        if ($routes === []) {
            return $this->configurationFailure('telegram_bot_proxies');
        }

        $payload = $this->messagePayload($chatId, $text, $parameters);
        $attempts = [];
        $lastResult = null;

        foreach ($routes as $route) {
            $attempts[] = $this->routeMetadata($route);

            try {
                $response = $this->sendRequest($route, $payload);
            } catch (ConnectionException) {
                $this->markProxyFailed($route['proxy']);

                $lastResult = ProviderSendResult::failed(
                    provider: self::PROVIDER,
                    errorCode: 'connection_error',
                    errorMessage: 'ارتباط با تلگرام از مسیر ارتباطی فعلی برقرار نشد.',
                    retryable: true,
                );

                continue;
            } catch (Throwable $exception) {
                logger()->error('Telegram gateway failed unexpectedly.', [
                    'exception' => $exception::class,
                    'transport' => $route['transport'],
                    'proxy_fingerprint' => $route['fingerprint'],
                ]);

                return ProviderSendResult::failed(
                    provider: self::PROVIDER,
                    errorCode: 'unexpected_error',
                    errorMessage: 'ارسال پیام تلگرام با خطای غیرمنتظره مواجه شد.',
                    retryable: false,
                    payload: ['attempts' => $attempts],
                );
            }

            $result = $this->mapResponse($response, $route);

            if ($result->successful) {
                $this->markProxyHealthy($route['proxy']);

                return $this->withAttemptMetadata($result, $attempts);
            }

            $lastResult = $result;

            if (! $this->shouldTryNextRoute($response)) {
                return $this->withAttemptMetadata($result, $attempts);
            }

            $this->markProxyFailed($route['proxy']);
        }

        return $this->withAttemptMetadata(
            $lastResult ?? ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'connection_error',
                errorMessage: 'هیچ مسیر فعالی برای اتصال به تلگرام در دسترس نیست.',
                retryable: true,
            ),
            $attempts,
        );
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    public function sendToDefaultChat(string $text, array $parameters = []): ProviderSendResult
    {
        return $this->sendToConfiguredChat('telegram_bot_default_chat_id', $text, $parameters);
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    public function sendToLegalQuestionsChannel(string $text, array $parameters = []): ProviderSendResult
    {
        return $this->sendToConfiguredChat(
            'legal_questions_channel_telegram_chat_id',
            $text,
            $parameters,
        );
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    public function sendToConfiguredChat(
        string $chatIdOptionKey,
        string $text,
        array $parameters = []
    ): ProviderSendResult {
        $chatId = $this->settings->string($chatIdOptionKey);

        if (blank($chatId)) {
            return $this->configurationFailure($chatIdOptionKey);
        }

        return $this->sendToChat($chatId, $text, $parameters);
    }

    /**
     * @param  array<string, mixed>  $parameters
     * @return array<string, mixed>
     */
    private function messagePayload(int|string $chatId, string $text, array $parameters): array
    {
        $payload = [
            'chat_id' => (string) $chatId,
            'text' => $text,
        ];

        $parseMode = $this->settings->string('telegram_bot_parse_mode');

        if (in_array($parseMode, ['HTML', 'Markdown', 'MarkdownV2'], true)) {
            $payload['parse_mode'] = $parseMode;
        }

        if ($this->settings->enabled('telegram_bot_disable_notification')) {
            $payload['disable_notification'] = true;
        }

        if ($this->settings->enabled('telegram_bot_disable_link_preview', true)) {
            $payload['link_preview_options'] = ['is_disabled' => true];
        }

        foreach (self::ALLOWED_SEND_MESSAGE_PARAMETERS as $key) {
            if (array_key_exists($key, $parameters)) {
                $payload[$key] = $parameters[$key];
            }
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array{transport: string, proxy: ?string, fingerprint: ?string, url: string, relay_secret: ?string}  $route
     */
    private function sendRequest(array $route, array $payload): Response
    {
        $request = $this->request($route);

        if ($route['transport'] !== 'relay') {
            return $request->post($route['url'], $payload);
        }

        $body = json_encode(
            $payload,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
        );
        $timestamp = (string) now()->timestamp;
        $signature = hash_hmac(
            'sha256',
            $timestamp.'.'.$body,
            (string) $route['relay_secret'],
        );

        return $request
            ->withHeaders([
                'X-Dadline-Relay-Timestamp' => $timestamp,
                'X-Dadline-Relay-Signature' => 'sha256='.$signature,
                'X-Dadline-Relay-Version' => '1',
                'X-Dadline-Request-Id' => (string) str()->uuid(),
            ])
            ->withBody($body, 'application/json')
            ->send('POST', $route['url']);
    }

    /**
     * @param  array{transport: string, proxy: ?string, fingerprint: ?string, url: string, relay_secret: ?string}  $route
     */
    private function request(array $route): PendingRequest
    {
        $request = Http::acceptJson()
            ->asJson()
            ->connectTimeout(max(1, min(30, $this->settings->integer('telegram_bot_connect_timeout_seconds', 8))))
            ->timeout(max(1, min(120, $this->settings->integer('telegram_bot_timeout_seconds', 20))))
            ->withAttributes([
                'telegram_transport' => $route['transport'],
                'telegram_proxy_fingerprint' => $route['fingerprint'],
            ]);

        if ($route['transport'] === 'proxy' && $route['proxy'] !== null) {
            $request = $request->withOptions([
                'proxy' => $route['proxy'],
            ]);
        }

        return $request;
    }

    private function transportConfigurationFailure(): ?ProviderSendResult
    {
        if ($this->settings->enabled('telegram_bot_relay_enabled')) {
            if (blank($this->settings->string('telegram_bot_relay_url'))) {
                return $this->configurationFailure('telegram_bot_relay_url');
            }

            if (blank($this->settings->string('telegram_bot_relay_secret'))) {
                return $this->configurationFailure('telegram_bot_relay_secret');
            }

            return null;
        }

        if (blank($this->settings->string('telegram_bot_token'))) {
            return $this->configurationFailure('telegram_bot_token');
        }

        if (
            $this->settings->enabled('telegram_bot_proxy_enabled', true)
            && $this->configuredProxies() === []
            && ! $this->settings->enabled('telegram_bot_direct_fallback_enabled')
        ) {
            return $this->configurationFailure('telegram_bot_proxies');
        }

        return null;
    }

    /**
     * @return array<int, array{transport: string, proxy: ?string, fingerprint: ?string, url: string, relay_secret: ?string}>
     */
    private function transportRoutes(): array
    {
        $routes = [];

        if ($this->settings->enabled('telegram_bot_relay_enabled')) {
            $routes[] = [
                'transport' => 'relay',
                'proxy' => null,
                'fingerprint' => null,
                'url' => (string) $this->settings->string('telegram_bot_relay_url'),
                'relay_secret' => $this->settings->string('telegram_bot_relay_secret'),
            ];

            if (! $this->settings->enabled('telegram_bot_relay_fallback_enabled')) {
                return $routes;
            }
        }

        $token = $this->settings->string('telegram_bot_token');

        if (blank($token)) {
            return $routes;
        }

        $baseUrl = $this->settings->string('telegram_bot_api_base_url', self::DEFAULT_API_BASE_URL)
            ?? self::DEFAULT_API_BASE_URL;
        $telegramUrl = rtrim($baseUrl, '/').'/bot'.$token.'/sendMessage';

        if (! $this->settings->enabled('telegram_bot_proxy_enabled', true)) {
            $routes[] = [
                'transport' => 'direct',
                'proxy' => null,
                'fingerprint' => null,
                'url' => $telegramUrl,
                'relay_secret' => null,
            ];

            return $routes;
        }

        $proxies = $this->orderedProxies($this->configuredProxies());
        $maxAttempts = $this->settings->integer('telegram_bot_max_proxy_attempts');

        if ($maxAttempts > 0) {
            $proxies = array_slice($proxies, 0, $maxAttempts);
        }

        foreach ($proxies as $proxy) {
            $routes[] = [
                'transport' => 'proxy',
                'proxy' => $proxy,
                'fingerprint' => $this->proxyFingerprint($proxy),
                'url' => $telegramUrl,
                'relay_secret' => null,
            ];
        }

        if ($this->settings->enabled('telegram_bot_direct_fallback_enabled')) {
            $routes[] = [
                'transport' => 'direct',
                'proxy' => null,
                'fingerprint' => null,
                'url' => $telegramUrl,
                'relay_secret' => null,
            ];
        }

        return $routes;
    }

    /**
     * @return array<int, string>
     */
    private function configuredProxies(): array
    {
        $value = Option::get('telegram_bot_proxies', []);

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded)
                ? $decoded
                : (preg_split('/[\r\n,]+/', $value) ?: []);
        }

        if (! is_array($value)) {
            return [];
        }

        $proxies = [];

        foreach ($value as $proxy) {
            if (! is_scalar($proxy)) {
                continue;
            }

            $proxy = trim((string) $proxy);

            if ($this->validProxyUrl($proxy)) {
                $proxies[] = $proxy;
            }
        }

        return array_values(array_unique($proxies));
    }

    private function validProxyUrl(string $proxy): bool
    {
        if ($proxy === '') {
            return false;
        }

        $parts = parse_url($proxy);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = trim((string) ($parts['host'] ?? ''));
        $port = (int) ($parts['port'] ?? 0);

        return in_array($scheme, self::SUPPORTED_PROXY_SCHEMES, true)
            && $host !== ''
            && $port >= 1
            && $port <= 65535;
    }

    /**
     * @param  array<int, string>  $proxies
     * @return array<int, string>
     */
    private function orderedProxies(array $proxies): array
    {
        $count = count($proxies);

        if ($count < 2) {
            return $proxies;
        }

        $cursorKey = 'notifications:telegram:proxy-cursor';
        $cursor = (int) Cache::get($cursorKey, 0);
        Cache::put($cursorKey, $cursor + 1, now()->addDays(7));
        $offset = $cursor % $count;
        $rotated = array_merge(
            array_slice($proxies, $offset),
            array_slice($proxies, 0, $offset),
        );

        $healthy = [];
        $temporarilyFailed = [];

        foreach ($rotated as $proxy) {
            if (Cache::has($this->proxyFailureCacheKey($proxy))) {
                $temporarilyFailed[] = $proxy;
            } else {
                $healthy[] = $proxy;
            }
        }

        return array_merge($healthy, $temporarilyFailed);
    }

    /**
     * @param  array{transport: string, proxy: ?string, fingerprint: ?string, url: string, relay_secret: ?string}  $route
     */
    private function mapResponse(Response $response, array $route): ProviderSendResult
    {
        $payload = $response->json();

        if (! is_array($payload)) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'invalid_response',
                errorMessage: 'پاسخ تلگرام قابل پردازش نیست.',
                retryable: $this->retryableStatus($response->status()),
                payload: $this->responseMetadata($response, $route),
            );
        }

        if ($response->successful() && ($payload['ok'] ?? false) === true) {
            $messageId = data_get($payload, 'result.message_id');
            $chatId = data_get($payload, 'result.chat.id');

            return ProviderSendResult::sent(
                provider: self::PROVIDER,
                messageId: is_scalar($messageId) ? (string) $messageId : null,
                payload: array_merge($this->responseMetadata($response, $route), [
                    'telegram' => [
                        'message_id' => is_scalar($messageId) ? (string) $messageId : null,
                        'chat_id' => is_scalar($chatId) ? (string) $chatId : null,
                    ],
                ]),
            );
        }

        $errorCode = $payload['error_code'] ?? 'http_'.$response->status();
        $errorMessage = $payload['description'] ?? 'تلگرام ارسال پیام را تایید نکرد.';
        $retryAfter = data_get($payload, 'parameters.retry_after');
        $migrateToChatId = data_get($payload, 'parameters.migrate_to_chat_id');

        return ProviderSendResult::failed(
            provider: self::PROVIDER,
            errorCode: is_scalar($errorCode) ? (string) $errorCode : 'send_rejected',
            errorMessage: is_string($errorMessage) ? $errorMessage : 'تلگرام ارسال پیام را تایید نکرد.',
            retryable: $this->retryableStatus($response->status())
                || $this->retryableTelegramCode($errorCode),
            payload: array_merge($this->responseMetadata($response, $route), [
                'telegram' => [
                    'error_code' => is_scalar($errorCode) ? (string) $errorCode : null,
                    'retry_after' => is_numeric($retryAfter) ? (int) $retryAfter : null,
                    'migrate_to_chat_id' => is_scalar($migrateToChatId) ? (string) $migrateToChatId : null,
                ],
            ]),
        );
    }

    private function shouldTryNextRoute(Response $response): bool
    {
        return in_array($response->status(), [407, 408, 425], true)
            || $response->status() >= 500;
    }

    private function retryableTelegramCode(mixed $code): bool
    {
        if (! is_numeric($code)) {
            return false;
        }

        $code = (int) $code;

        return $code === 429 || $code >= 500;
    }

    private function retryableStatus(int $status): bool
    {
        return $status === 407
            || $status === 408
            || $status === 425
            || $status === 429
            || $status >= 500;
    }

    private function markProxyFailed(?string $proxy): void
    {
        if ($proxy === null) {
            return;
        }

        Cache::put(
            $this->proxyFailureCacheKey($proxy),
            true,
            now()->addSeconds(max(30, $this->settings->integer('telegram_bot_proxy_failure_ttl_seconds', 300))),
        );
    }

    private function markProxyHealthy(?string $proxy): void
    {
        if ($proxy !== null) {
            Cache::forget($this->proxyFailureCacheKey($proxy));
        }
    }

    private function proxyFailureCacheKey(string $proxy): string
    {
        return 'notifications:telegram:proxy-failed:'.hash('sha256', $proxy);
    }

    private function proxyFingerprint(?string $proxy): ?string
    {
        return $proxy === null ? null : substr(hash('sha256', $proxy), 0, 12);
    }

    /**
     * @param  array{transport: string, proxy: ?string, fingerprint: ?string, url: string, relay_secret: ?string}  $route
     * @return array<string, mixed>
     */
    private function responseMetadata(Response $response, array $route): array
    {
        return [
            'http_status' => $response->status(),
            'transport' => $route['transport'],
            'proxy_fingerprint' => $route['fingerprint'],
            'relay_request_id' => $route['transport'] === 'relay'
                ? $response->header('X-Dadline-Relay-Request-Id')
                : null,
        ];
    }

    /**
     * @param  array{transport: string, proxy: ?string, fingerprint: ?string, url: string, relay_secret: ?string}  $route
     * @return array<string, mixed>
     */
    private function routeMetadata(array $route): array
    {
        return [
            'transport' => $route['transport'],
            'proxy_fingerprint' => $route['fingerprint'],
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $attempts
     */
    private function withAttemptMetadata(ProviderSendResult $result, array $attempts): ProviderSendResult
    {
        $payload = array_merge($result->payload, [
            'attempts' => $attempts,
        ]);

        if ($result->successful) {
            return ProviderSendResult::sent(
                provider: $result->provider,
                messageId: $result->messageId,
                payload: $payload,
            );
        }

        return ProviderSendResult::failed(
            provider: $result->provider,
            errorCode: $result->errorCode,
            errorMessage: $result->errorMessage,
            retryable: $result->retryable,
            payload: $payload,
        );
    }

    private function configurationFailure(string $key): ProviderSendResult
    {
        return ProviderSendResult::failed(
            provider: self::PROVIDER,
            errorCode: 'provider_not_configured',
            errorMessage: "تنظیم [{$key}] برای درگاه تلگرام انجام نشده است.",
            retryable: false,
        );
    }
}
