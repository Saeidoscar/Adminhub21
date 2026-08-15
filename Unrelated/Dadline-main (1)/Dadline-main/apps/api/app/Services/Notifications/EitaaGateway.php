<?php

namespace App\Services\Notifications;

use App\Services\ExternalServices\OptionServiceSettings;
use App\Services\Notifications\Data\ProviderSendResult;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Throwable;

class EitaaGateway
{
    private const PROVIDER = 'eitaa-yar';

    private const DEFAULT_APP_API_URL = 'https://eitaayar.ir/api/app/sendMessage';

    private const DEFAULT_BOT_API_BASE_URL = 'https://eitaayar.ir/api';

    public function __construct(
        private readonly OptionServiceSettings $settings,
    ) {}

    public function sendToAppChat(int|string $chatId, string $text): ProviderSendResult
    {
        $token = $this->settings->string('eitaa_app_token');

        if (blank($token)) {
            return $this->configurationFailure('eitaa_app_token');
        }

        return $this->postJson(
            url: $this->settings->string('eitaa_app_api_url', self::DEFAULT_APP_API_URL)
                ?? self::DEFAULT_APP_API_URL,
            payload: [
                'token' => $token,
                'chat_id' => is_numeric($chatId) ? (int) $chatId : (string) $chatId,
                'text' => $text,
            ],
        );
    }

    public function getBotInfo(?string $token = null): ProviderSendResult
    {
        $token = $this->normalizeBotToken(
            $token ?? $this->settings->string('eitaa_token_bot')
        );

        if ($token === null) {
            return $this->configurationFailure('eitaa_token_bot');
        }

        return $this->get($this->botMethodUrl($token, 'getMe'));
    }

    public function sendToBotChat(int|string $chatId, string $text, ?string $token = null): ProviderSendResult
    {
        $token = $this->normalizeBotToken(
            $token ?? $this->settings->string('eitaa_token_bot')
        );

        if ($token === null) {
            return $this->configurationFailure('eitaa_token_bot');
        }

        return $this->postJson(
            url: $this->botMethodUrl($token, 'sendMessage'),
            payload: [
                'chat_id' => is_numeric($chatId) ? (int) $chatId : (string) $chatId,
                'title' => '',
                'text' => $text,
            ],
        );
    }

    public function sendToConfiguredBotChat(string $chatIdOptionKey, string $text): ProviderSendResult
    {
        $chatId = $this->settings->string($chatIdOptionKey);

        if (blank($chatId)) {
            return $this->configurationFailure($chatIdOptionKey);
        }

        return $this->sendToBotChat($chatId, $text);
    }

    public function sendToLegalQuestionsChannel(string $text): ProviderSendResult
    {
        return $this->sendToConfiguredBotChat('legal_questions_channel_eitaaid', $text);
    }

    private function get(string $url): ProviderSendResult
    {
        try {
            $response = $this->pendingRequest()->get($url);
        } catch (ConnectionException $exception) {
            return $this->connectionFailure($exception);
        } catch (Throwable $exception) {
            return $this->unexpectedFailure($exception);
        }

        return $this->mapResponse($response);
    }

    /**
     * @param  array<string, scalar|null>  $payload
     */
    private function postJson(string $url, array $payload): ProviderSendResult
    {
        if (array_key_exists('text', $payload) && blank(trim((string) $payload['text']))) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'empty_message',
                errorMessage: 'متن پیام ایتا نمی‌تواند خالی باشد.',
                retryable: false,
            );
        }

        try {
            $response = $this->pendingRequest()
                ->asJson()
                ->post($url, $payload);
        } catch (ConnectionException $exception) {
            return $this->connectionFailure($exception);
        } catch (Throwable $exception) {
            return $this->unexpectedFailure($exception);
        }

        return $this->mapResponse($response);
    }

    private function pendingRequest(): PendingRequest
    {
        return Http::acceptJson()
            ->connectTimeout(max(1, min(10, $this->settings->integer('eitaa_connect_timeout_seconds', 5))))
            ->timeout(max(1, $this->settings->integer('eitaa_timeout_seconds', 30)));
    }

    private function botMethodUrl(string $token, string $method): string
    {
        $baseUrl = $this->settings->string('eitaa_bot_api_base_url', self::DEFAULT_BOT_API_BASE_URL)
            ?? self::DEFAULT_BOT_API_BASE_URL;

        return rtrim($baseUrl, '/').'/'.$token.'/'.$method;
    }

    private function normalizeBotToken(?string $token): ?string
    {
        if ($token === null) {
            return null;
        }

        $token = trim($token, " \t\n\r\0\x0B\"'");

        return $token === '' ? null : $token;
    }

    private function mapResponse(Response $response): ProviderSendResult
    {
        $payload = $response->json();

        if (! is_array($payload)) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'invalid_response',
                errorMessage: 'پاسخ سرویس ایتا قابل پردازش نیست.',
                retryable: $this->retryableStatus($response->status()),
                payload: ['http_status' => $response->status()],
            );
        }

        if ($response->successful() && ($payload['ok'] ?? false) === true) {
            $messageId = data_get($payload, 'result.message_id')
                ?? data_get($payload, 'result.messageId')
                ?? ($payload['message_id'] ?? null);

            return ProviderSendResult::sent(
                provider: self::PROVIDER,
                messageId: is_scalar($messageId) ? (string) $messageId : null,
                payload: [
                    'http_status' => $response->status(),
                    'response' => $payload,
                ],
            );
        }

        $errorCode = $payload['error_code'] ?? $payload['code'] ?? 'http_'.$response->status();
        $errorMessage = $payload['description']
            ?? $payload['message']
            ?? 'سرویس ایتا ارسال پیام را تایید نکرد.';

        if ((string) $errorCode === '401') {
            $errorMessage = 'توکن API ایتایار نامعتبر، منقضی یا لغو شده است.';
        }

        return ProviderSendResult::failed(
            provider: self::PROVIDER,
            errorCode: is_scalar($errorCode) ? (string) $errorCode : 'send_rejected',
            errorMessage: is_string($errorMessage) ? $errorMessage : 'سرویس ایتا ارسال پیام را تایید نکرد.',
            retryable: $this->retryableStatus($response->status())
                || $this->retryableCode($errorCode),
            payload: [
                'http_status' => $response->status(),
                'response' => $payload,
            ],
        );
    }

    private function connectionFailure(ConnectionException $exception): ProviderSendResult
    {
        return ProviderSendResult::failed(
            provider: self::PROVIDER,
            errorCode: 'connection_error',
            errorMessage: 'ارتباط با سرویس ایتا برقرار نشد.',
            retryable: true,
            payload: ['exception' => $exception::class],
        );
    }

    private function unexpectedFailure(Throwable $exception): ProviderSendResult
    {
        report($exception);

        return ProviderSendResult::failed(
            provider: self::PROVIDER,
            errorCode: 'unexpected_error',
            errorMessage: 'ارسال درخواست ایتا با خطای غیرمنتظره مواجه شد.',
            retryable: false,
        );
    }

    private function retryableCode(mixed $code): bool
    {
        if (! is_numeric($code)) {
            return false;
        }

        $code = (int) $code;

        return $code === 408
            || $code === 425
            || $code === 429
            || $code >= 500;
    }

    private function configurationFailure(string $key): ProviderSendResult
    {
        return ProviderSendResult::failed(
            provider: self::PROVIDER,
            errorCode: 'provider_not_configured',
            errorMessage: "تنظیم [{$key}] برای سرویس ایتا انجام نشده است.",
            retryable: false,
        );
    }

    private function retryableStatus(int $status): bool
    {
        return $status === 408
            || $status === 425
            || $status === 429
            || $status >= 500;
    }
}
