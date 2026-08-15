<?php

namespace App\Services\Notifications;

use App\Services\ExternalServices\OptionServiceSettings;
use App\Services\Notifications\Data\ProviderSendResult;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class BaleGateway
{
    private const BOT_PROVIDER = 'bale-bot-api';

    private const SAFIR_PROVIDER = 'bale-safir';

    private const DEFAULT_BOT_API_BASE_URL = 'https://tapi.bale.ai';

    private const DEFAULT_SAFIR_API_URL = 'https://safir.bale.ai/api/v3/send_message';

    private const MAX_MESSAGE_LENGTH = 4096;

    /**
     * @var array<int, string>
     */
    private const ALLOWED_SEND_MESSAGE_PARAMETERS = [
        'reply_to_message_id',
        'reply_markup',
    ];

    public function __construct(
        private readonly OptionServiceSettings $settings,
    ) {}

    public function getBotInfo(?string $token = null): ProviderSendResult
    {
        $token = $this->normalizeToken($token ?? $this->settings->string('bale_bot_token'));

        if ($token === null) {
            return $this->configurationFailure(self::BOT_PROVIDER, 'bale_bot_token');
        }

        return $this->botRequest('GET', $this->botMethodUrl($token, 'getMe'));
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    public function sendToChat(int|string $chatId, string $text, array $parameters = []): ProviderSendResult
    {
        if (! $this->settings->enabled('bale_bot_enabled')) {
            return ProviderSendResult::failed(
                provider: self::BOT_PROVIDER,
                errorCode: 'provider_disabled',
                errorMessage: 'درگاه بازوی بله غیرفعال است.',
                retryable: false,
            );
        }

        if (blank((string) $chatId)) {
            return ProviderSendResult::failed(
                provider: self::BOT_PROVIDER,
                errorCode: 'missing_recipient',
                errorMessage: 'شناسه گفتگو یا کانال بله مشخص نیست.',
                retryable: false,
            );
        }

        $textFailure = $this->validateText($text, self::BOT_PROVIDER);

        if ($textFailure !== null) {
            return $textFailure;
        }

        $token = $this->normalizeToken($this->settings->string('bale_bot_token'));

        if ($token === null) {
            return $this->configurationFailure(self::BOT_PROVIDER, 'bale_bot_token');
        }

        $payload = [
            'chat_id' => is_numeric($chatId) ? (int) $chatId : (string) $chatId,
            'text' => trim($text),
        ];

        foreach (self::ALLOWED_SEND_MESSAGE_PARAMETERS as $key) {
            if (array_key_exists($key, $parameters)) {
                $payload[$key] = $parameters[$key];
            }
        }

        return $this->botRequest(
            method: 'POST',
            url: $this->botMethodUrl($token, 'sendMessage'),
            payload: $payload,
        );
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    public function sendToDefaultChat(string $text, array $parameters = []): ProviderSendResult
    {
        return $this->sendToConfiguredChat('bale_bot_default_chat_id', $text, $parameters);
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    public function sendToLegalQuestionsChannel(string $text, array $parameters = []): ProviderSendResult
    {
        return $this->sendToConfiguredChat(
            'legal_questions_channel_bale_chat_id',
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
            return $this->configurationFailure(self::BOT_PROVIDER, $chatIdOptionKey);
        }

        return $this->sendToChat($chatId, $text, $parameters);
    }

    /**
     * Send a normal Safir message to a Bale user by Iranian mobile number.
     *
     * @param  array<string, mixed>|null  $replyMarkup
     */
    public function sendToPhone(
        string $phoneNumber,
        string $text,
        ?string $requestId = null,
        ?array $replyMarkup = null,
    ): ProviderSendResult {
        if (! $this->settings->enabled('bale_safir_enabled')) {
            return ProviderSendResult::failed(
                provider: self::SAFIR_PROVIDER,
                errorCode: 'provider_disabled',
                errorMessage: 'سرویس سفیر بله غیرفعال است.',
                retryable: false,
            );
        }

        $textFailure = $this->validateText($text, self::SAFIR_PROVIDER);

        if ($textFailure !== null) {
            return $textFailure;
        }

        $phoneNumber = $this->normalizeIranianMobile($phoneNumber);

        if ($phoneNumber === null) {
            return ProviderSendResult::failed(
                provider: self::SAFIR_PROVIDER,
                errorCode: 'invalid_phone',
                errorMessage: 'شماره موبایل مقصد برای سرویس سفیر بله معتبر نیست.',
                retryable: false,
            );
        }

        $message = ['text' => trim($text)];

        if ($replyMarkup !== null) {
            $message['reply_markup'] = $replyMarkup;
        }

        return $this->sendSafirPayload([
            'request_id' => $this->requestId($requestId),
            'bot_id' => $this->safirBotId(),
            'phone_number' => $phoneNumber,
            'message_data' => [
                'message' => $message,
            ],
        ]);
    }

    public function sendOtpToPhone(
        string $phoneNumber,
        string $otp,
        ?string $requestId = null,
    ): ProviderSendResult {
        if (! $this->settings->enabled('bale_safir_enabled')) {
            return ProviderSendResult::failed(
                provider: self::SAFIR_PROVIDER,
                errorCode: 'provider_disabled',
                errorMessage: 'سرویس سفیر بله غیرفعال است.',
                retryable: false,
            );
        }

        $phoneNumber = $this->normalizeIranianMobile($phoneNumber);

        if ($phoneNumber === null) {
            return ProviderSendResult::failed(
                provider: self::SAFIR_PROVIDER,
                errorCode: 'invalid_phone',
                errorMessage: 'شماره موبایل مقصد برای سرویس سفیر بله معتبر نیست.',
                retryable: false,
            );
        }

        $otp = trim($otp);

        if ($otp === '' || ! ctype_digit($otp)) {
            return ProviderSendResult::failed(
                provider: self::SAFIR_PROVIDER,
                errorCode: 'invalid_otp',
                errorMessage: 'رمز یک‌بارمصرف بله باید فقط شامل رقم باشد.',
                retryable: false,
            );
        }

        return $this->sendSafirPayload([
            'request_id' => $this->requestId($requestId),
            'bot_id' => $this->safirBotId(),
            'phone_number' => $phoneNumber,
            'message_data' => [
                'otp_message' => [
                    'otp' => $otp,
                ],
            ],
        ]);
    }

    public function isPhoneRecipient(int|string $recipient): bool
    {
        return $this->normalizeIranianMobile((string) $recipient) !== null;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function botRequest(string $method, string $url, array $payload = []): ProviderSendResult
    {
        try {
            $request = $this->botPendingRequest();
            $response = strtoupper($method) === 'GET'
                ? $request->get($url, $payload)
                : $request->post($url, $payload);
        } catch (ConnectionException $exception) {
            return $this->connectionFailure(self::BOT_PROVIDER, $exception, 'ارتباط با API بازوی بله برقرار نشد.');
        } catch (Throwable $exception) {
            return $this->unexpectedFailure(self::BOT_PROVIDER, $exception, 'ارسال درخواست به API بازوی بله با خطای غیرمنتظره مواجه شد.');
        }

        return $this->mapBotResponse($response);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function sendSafirPayload(array $payload): ProviderSendResult
    {
        $accessKey = $this->settings->string('bale_safir_api_access_key');

        if (blank($accessKey)) {
            return $this->configurationFailure(self::SAFIR_PROVIDER, 'bale_safir_api_access_key');
        }

        if ($payload['bot_id'] === null) {
            return $this->configurationFailure(self::SAFIR_PROVIDER, 'bale_safir_bot_id');
        }

        try {
            $response = $this->safirPendingRequest()
                ->withHeaders(['api-access-key' => $accessKey])
                ->post(
                    $this->settings->string('bale_safir_api_url', self::DEFAULT_SAFIR_API_URL)
                        ?? self::DEFAULT_SAFIR_API_URL,
                    $payload,
                );
        } catch (ConnectionException $exception) {
            return $this->connectionFailure(self::SAFIR_PROVIDER, $exception, 'ارتباط با سرویس سفیر بله برقرار نشد.');
        } catch (Throwable $exception) {
            return $this->unexpectedFailure(self::SAFIR_PROVIDER, $exception, 'ارسال درخواست به سرویس سفیر بله با خطای غیرمنتظره مواجه شد.');
        }

        return $this->mapSafirResponse($response);
    }

    private function botPendingRequest(): PendingRequest
    {
        return Http::acceptJson()
            ->asJson()
            ->connectTimeout(max(1, min(30, $this->settings->integer('bale_bot_connect_timeout_seconds', 5))))
            ->timeout(max(1, min(120, $this->settings->integer('bale_bot_timeout_seconds', 20))));
    }

    private function safirPendingRequest(): PendingRequest
    {
        return Http::acceptJson()
            ->asJson()
            ->connectTimeout(max(1, min(30, $this->settings->integer('bale_safir_connect_timeout_seconds', 5))))
            ->timeout(max(1, min(120, $this->settings->integer('bale_safir_timeout_seconds', 20))));
    }

    private function botMethodUrl(string $token, string $method): string
    {
        $baseUrl = $this->settings->string('bale_bot_api_base_url', self::DEFAULT_BOT_API_BASE_URL)
            ?? self::DEFAULT_BOT_API_BASE_URL;

        return rtrim($baseUrl, '/').'/bot'.$token.'/'.$method;
    }

    private function normalizeToken(?string $token): ?string
    {
        if ($token === null) {
            return null;
        }

        $token = trim($token, " \t\n\r\0\x0B\"'");
        $token = preg_replace('/^bot(?=\d+:)/i', '', $token) ?? $token;

        return $token === '' ? null : $token;
    }

    private function safirBotId(): ?int
    {
        $botId = $this->settings->string('bale_safir_bot_id');

        return is_numeric($botId) ? (int) $botId : null;
    }

    private function normalizeIranianMobile(string $phoneNumber): ?string
    {
        $phoneNumber = preg_replace('/[^0-9+]/', '', trim($phoneNumber)) ?? '';
        $phoneNumber = ltrim($phoneNumber, '+');

        if (preg_match('/^09\d{9}$/', $phoneNumber) === 1) {
            $phoneNumber = '98'.substr($phoneNumber, 1);
        } elseif (preg_match('/^9\d{9}$/', $phoneNumber) === 1) {
            $phoneNumber = '98'.$phoneNumber;
        }

        return preg_match('/^989\d{9}$/', $phoneNumber) === 1
            ? $phoneNumber
            : null;
    }

    private function requestId(?string $requestId): string
    {
        $requestId = trim((string) $requestId);

        return $requestId !== '' ? $requestId : (string) Str::uuid();
    }

    private function mapBotResponse(Response $response): ProviderSendResult
    {
        $payload = $response->json();

        if (! is_array($payload)) {
            return ProviderSendResult::failed(
                provider: self::BOT_PROVIDER,
                errorCode: 'invalid_response',
                errorMessage: 'پاسخ API بازوی بله قابل پردازش نیست.',
                retryable: $this->retryableStatus($response->status()),
                payload: ['http_status' => $response->status()],
            );
        }

        if ($response->successful() && ($payload['ok'] ?? false) === true) {
            $messageId = data_get($payload, 'result.message_id');

            return ProviderSendResult::sent(
                provider: self::BOT_PROVIDER,
                messageId: is_scalar($messageId) ? (string) $messageId : null,
                payload: [
                    'http_status' => $response->status(),
                    'response' => $payload,
                ],
            );
        }

        $errorCode = $payload['error_code'] ?? 'http_'.$response->status();
        $errorMessage = $payload['description'] ?? 'API بازوی بله ارسال پیام را تایید نکرد.';
        $retryAfter = data_get($payload, 'parameters.retry_after');

        if ((string) $errorCode === '401' || $response->status() === 401) {
            $errorMessage = 'توکن بازوی بله نامعتبر، منقضی یا لغو شده است.';
        }

        return ProviderSendResult::failed(
            provider: self::BOT_PROVIDER,
            errorCode: is_scalar($errorCode) ? (string) $errorCode : 'send_rejected',
            errorMessage: is_string($errorMessage) ? $errorMessage : 'API بازوی بله ارسال پیام را تایید نکرد.',
            retryable: $this->retryableStatus($response->status()) || $this->retryableCode($errorCode),
            payload: [
                'http_status' => $response->status(),
                'retry_after' => is_numeric($retryAfter) ? (int) $retryAfter : null,
                'response' => $payload,
            ],
        );
    }

    private function mapSafirResponse(Response $response): ProviderSendResult
    {
        $payload = $response->json();

        if (! is_array($payload)) {
            return ProviderSendResult::failed(
                provider: self::SAFIR_PROVIDER,
                errorCode: 'invalid_response',
                errorMessage: 'پاسخ سرویس سفیر بله قابل پردازش نیست.',
                retryable: $this->retryableStatus($response->status()),
                payload: ['http_status' => $response->status()],
            );
        }

        $errors = $payload['error_data'] ?? null;

        if ($response->successful() && blank($errors) && filled($payload['message_id'] ?? null)) {
            return ProviderSendResult::sent(
                provider: self::SAFIR_PROVIDER,
                messageId: (string) $payload['message_id'],
                payload: [
                    'http_status' => $response->status(),
                    'response' => $payload,
                ],
            );
        }

        $firstError = is_array($errors) ? ($errors[0] ?? $errors) : [];
        $errorCode = is_array($firstError) ? ($firstError['code'] ?? null) : null;
        $errorMessage = is_array($firstError) ? ($firstError['description'] ?? null) : null;
        $errorMessage = $this->safirErrorMessage($errorCode, $errorMessage, $response->status());

        return ProviderSendResult::failed(
            provider: self::SAFIR_PROVIDER,
            errorCode: is_scalar($errorCode) ? (string) $errorCode : 'http_'.$response->status(),
            errorMessage: $errorMessage,
            retryable: $this->retryableStatus($response->status()) || in_array((int) $errorCode, [2, 3], true),
            payload: [
                'http_status' => $response->status(),
                'response' => $payload,
            ],
        );
    }

    private function safirErrorMessage(mixed $code, mixed $message, int $status): string
    {
        if ($status === 401 || $status === 403) {
            return 'کلید دسترسی سرویس سفیر بله نامعتبر یا فاقد دسترسی است.';
        }

        return match ((int) $code) {
            2 => 'سرویس سفیر بله با خطای داخلی مواجه شد.',
            3 => 'سقف نرخ ارسال پیام در سرویس سفیر بله رد شده است.',
            4 => 'ساختار درخواست ارسالی به سرویس سفیر بله نامعتبر است.',
            8 => 'شماره موبایل مقصد برای سرویس سفیر بله معتبر نیست.',
            17 => 'شماره مقصد در پیام‌رسان بله حساب فعال ندارد.',
            20 => 'اعتبار حساب سرویس سفیر بله کافی نیست.',
            21 => 'سقف تعداد مخاطبان بازوی بله تکمیل شده است.',
            default => is_string($message) && $message !== ''
                ? $message
                : 'سرویس سفیر بله ارسال پیام را تایید نکرد.',
        };
    }

    private function validateText(string $text, string $provider): ?ProviderSendResult
    {
        $text = trim($text);

        if ($text === '') {
            return ProviderSendResult::failed(
                provider: $provider,
                errorCode: 'empty_message',
                errorMessage: 'متن پیام بله نمی‌تواند خالی باشد.',
                retryable: false,
            );
        }

        if (mb_strlen($text) > self::MAX_MESSAGE_LENGTH) {
            return ProviderSendResult::failed(
                provider: $provider,
                errorCode: 'message_too_long',
                errorMessage: 'متن پیام بله نباید بیشتر از ۴۰۹۶ نویسه باشد.',
                retryable: false,
            );
        }

        return null;
    }

    private function connectionFailure(
        string $provider,
        ConnectionException $exception,
        string $message,
    ): ProviderSendResult {
        return ProviderSendResult::failed(
            provider: $provider,
            errorCode: 'connection_error',
            errorMessage: $message,
            retryable: true,
            payload: ['exception' => $exception::class],
        );
    }

    private function unexpectedFailure(string $provider, Throwable $exception, string $message): ProviderSendResult
    {
        report($exception);

        return ProviderSendResult::failed(
            provider: $provider,
            errorCode: 'unexpected_error',
            errorMessage: $message,
            retryable: false,
        );
    }

    private function configurationFailure(string $provider, string $key): ProviderSendResult
    {
        return ProviderSendResult::failed(
            provider: $provider,
            errorCode: 'provider_not_configured',
            errorMessage: "تنظیم [{$key}] برای سرویس بله انجام نشده است.",
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

    private function retryableStatus(int $status): bool
    {
        return $status === 408
            || $status === 425
            || $status === 429
            || $status >= 500;
    }
}
