<?php

namespace App\Services\Notifications\Providers;

use App\Models\NotificationDelivery;
use App\Models\NotificationTemplate;
use App\Services\ExternalServices\OptionServiceSettings;
use App\Services\Notifications\Contracts\SmsProvider;
use App\Services\Notifications\Data\ProviderSendResult;
use App\Services\Notifications\SmsProviderSelection;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use JsonException;
use Throwable;

class AdlySmsProvider implements SmsProvider
{
    private const PROVIDER = SmsProviderSelection::ADLY;

    private const DEFAULT_ENDPOINT = 'https://mydnspanel.com/webservice/server';

    public function __construct(
        private readonly OptionServiceSettings $settings,
        private readonly SmsProviderSelection $selection,
    ) {}

    public function name(): string
    {
        return self::PROVIDER;
    }

    public function supports(NotificationDelivery $delivery): bool
    {
        if (! $this->settings->enabled('adly_enabled') || ! $this->selection->allows(self::PROVIDER)) {
            return false;
        }

        if ($this->isOtp($delivery) && ! $this->selection->otpPatternFallbackEnabled()) {
            return false;
        }

        return filled($delivery->recipient) && filled($delivery->body);
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        $apiKey = $this->settings->string('adly_api_key');
        $endpoint = $this->settings->string('adly_api_url', self::DEFAULT_ENDPOINT)
            ?? self::DEFAULT_ENDPOINT;
        $recipient = $this->normalizeMobile((string) $delivery->recipient);
        $patternId = $this->patternId($delivery);

        if (blank($apiKey)) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'provider_not_configured',
                errorMessage: 'API Key درگاه پیامکی ادلی تنظیم نشده است.',
                retryable: false,
            );
        }

        if ($recipient === null) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'invalid_recipient',
                errorMessage: 'شماره موبایل گیرنده برای ارسال ادلی معتبر نیست.',
                retryable: false,
            );
        }

        if ($patternId !== null) {
            $sender = $this->settings->string('adly_pattern_sender')
                ?? $this->settings->string('adly_sender');

            if (blank($sender)) {
                return ProviderSendResult::failed(
                    provider: self::PROVIDER,
                    errorCode: 'sender_not_configured',
                    errorMessage: 'شماره فرستنده پترن ادلی تنظیم نشده است.',
                    retryable: false,
                );
            }

            $textData = $this->patternData($delivery);

            if ($textData instanceof ProviderSendResult) {
                return $textData;
            }

            try {
                $encodedTextData = json_encode(
                    $textData,
                    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
                );
            } catch (JsonException $exception) {
                return ProviderSendResult::failed(
                    provider: self::PROVIDER,
                    errorCode: 'invalid_pattern_data',
                    errorMessage: 'متغیرهای پترن ادلی قابل تبدیل به JSON نیستند.',
                    retryable: false,
                    payload: ['exception' => $exception->getMessage()],
                );
            }

            return $this->request(
                endpoint: $endpoint,
                apiKey: $apiKey,
                fields: [
                    'action' => 'sendServices',
                    'from' => $sender,
                    'textCode' => (string) $patternId,
                    'textData' => $encodedTextData,
                    'receivers' => $recipient,
                ],
                transport: 'pattern',
                patternId: $patternId,
            );
        }

        $sender = $this->settings->string('adly_sender');

        if (blank($sender)) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'sender_not_configured',
                errorMessage: 'شماره فرستنده پیامک ساده ادلی تنظیم نشده است.',
                retryable: false,
            );
        }

        return $this->request(
            endpoint: $endpoint,
            apiKey: $apiKey,
            fields: [
                'action' => 'send',
                'from' => $sender,
                'text' => (string) $delivery->body,
                'receivers' => $recipient,
            ],
            transport: 'simple',
        );
    }

    /**
     * @param  array<string, string>  $fields
     */
    private function request(
        string $endpoint,
        string $apiKey,
        array $fields,
        string $transport,
        ?int $patternId = null,
    ): ProviderSendResult {
        try {
            $response = Http::connectTimeout(max(1, $this->settings->integer('adly_connect_timeout_seconds', 5)))
                ->timeout(max(1, $this->settings->integer('adly_timeout_seconds', 20)))
                ->acceptJson()
                ->withHeaders(['Authorization' => $apiKey])
                ->asMultipart()
                ->post($endpoint, $fields);
        } catch (ConnectionException $exception) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'connection_error',
                errorMessage: 'ارتباط با وب‌سرویس ادلی برقرار نشد.',
                retryable: true,
                payload: [
                    'transport' => $transport,
                    'exception' => $exception->getMessage(),
                ],
            );
        } catch (Throwable $exception) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'provider_exception',
                errorMessage: $exception->getMessage(),
                retryable: true,
                payload: ['transport' => $transport],
            );
        }

        if (! $response->successful()) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'http_'.$response->status(),
                errorMessage: $this->responseMessage($response) ?? 'وب‌سرویس ادلی پاسخ HTTP معتبر برنگرداند.',
                retryable: $response->status() === 408
                    || $response->status() === 429
                    || $response->serverError(),
                payload: $this->responsePayload($response, $transport, $patternId),
            );
        }

        $failure = $this->explicitFailure($response);

        if ($failure !== null) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: $failure['code'],
                errorMessage: $failure['message'],
                retryable: $failure['retryable'],
                payload: $this->responsePayload($response, $transport, $patternId),
            );
        }

        $messageId = $this->messageId($response);

        if ($messageId === null && ! $this->hasExplicitSuccess($response)) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'invalid_response',
                errorMessage: 'پاسخ وب‌سرویس ادلی فاقد نشانه موفقیت یا شناسه ارسال است.',
                retryable: true,
                payload: $this->responsePayload($response, $transport, $patternId),
            );
        }

        return ProviderSendResult::sent(
            provider: self::PROVIDER,
            messageId: $messageId,
            payload: $this->responsePayload($response, $transport, $patternId),
        );
    }

    private function patternId(NotificationDelivery $delivery): ?int
    {
        $value = data_get($delivery->provider_payload, 'patterns.'.self::PROVIDER.'.id');

        return is_numeric($value) && (int) $value > 0 ? (int) $value : null;
    }

    /**
     * @return array<string, string>|ProviderSendResult
     */
    private function patternData(NotificationDelivery $delivery): array|ProviderSendResult
    {
        $configuredVariables = data_get(
            $delivery->provider_payload,
            'patterns.'.self::PROVIDER.'.variables',
        );

        $variables = is_array($configuredVariables)
            ? array_values($configuredVariables)
            : $this->templateVariables($delivery);

        $data = [];

        foreach ($variables as $variable) {
            $payloadKey = trim((string) $variable, " \t\n\r\0\x0B{}");

            if ($payloadKey === '' || ! array_key_exists($payloadKey, $delivery->payload ?? [])) {
                return ProviderSendResult::failed(
                    provider: self::PROVIDER,
                    errorCode: 'missing_pattern_variable',
                    errorMessage: "متغیر {$payloadKey} برای پترن ادلی مقداردهی نشده است.",
                    retryable: false,
                    payload: ['variable' => $payloadKey],
                );
            }

            $value = data_get($delivery->payload, $payloadKey);

            if (! is_scalar($value) && $value !== null) {
                return ProviderSendResult::failed(
                    provider: self::PROVIDER,
                    errorCode: 'invalid_pattern_variable',
                    errorMessage: "مقدار متغیر {$payloadKey} برای پترن ادلی معتبر نیست.",
                    retryable: false,
                    payload: ['variable' => $payloadKey],
                );
            }

            $data['{'.$payloadKey.'}'] = (string) $value;
        }

        return $data;
    }

    /**
     * @return array<int, string>
     */
    private function templateVariables(NotificationDelivery $delivery): array
    {
        $template = NotificationTemplate::query()
            ->where('key', $this->templateKey($delivery))
            ->where('channel', 'sms')
            ->first(['variables']);

        return collect($template?->variables ?? [])
            ->map(fn (mixed $value): string => (string) $value)
            ->values()
            ->all();
    }

    private function isOtp(NotificationDelivery $delivery): bool
    {
        return str_contains($this->templateKey($delivery), 'otp');
    }

    private function templateKey(NotificationDelivery $delivery): string
    {
        return (string) ($delivery->notification?->template_key
            ?? $delivery->notification()->value('template_key'));
    }

    private function normalizeMobile(string $mobile): ?string
    {
        $digits = preg_replace('/\D+/', '', $mobile) ?? '';

        if (str_starts_with($digits, '0098')) {
            $digits = substr($digits, 2);
        } elseif (str_starts_with($digits, '0')) {
            $digits = '98'.substr($digits, 1);
        } elseif (strlen($digits) === 10 && str_starts_with($digits, '9')) {
            $digits = '98'.$digits;
        }

        return preg_match('/^989\d{9}$/', $digits) === 1 ? $digits : null;
    }

    /**
     * @return array{code: string, message: string, retryable: bool}|null
     */
    private function explicitFailure(Response $response): ?array
    {
        $json = $response->json();

        if (! is_array($json)) {
            $body = strtolower(trim($response->body()));

            if ($body === '' || preg_match('/^(false|error|failed|failure)(?:\b|:)/', $body) !== 1) {
                return null;
            }

            return [
                'code' => 'send_rejected',
                'message' => trim($response->body()),
                'retryable' => false,
            ];
        }

        $status = data_get($json, 'success', data_get($json, 'ok', data_get($json, 'status')));
        $error = data_get($json, 'error', data_get($json, 'errors'));
        $errorCode = data_get($json, 'error_code', data_get($json, 'errorCode', data_get($json, 'code')));
        $failureStatus = $status === false
            || $status === 0
            || $status === '0'
            || in_array(strtolower((string) $status), ['false', 'error', 'failed', 'failure', 'rejected'], true);

        if (! $failureStatus && blank($error)) {
            return null;
        }

        $message = $this->responseMessage($response) ?? 'درگاه ادلی ارسال پیامک را رد کرد.';
        $code = filled($errorCode) ? (string) $errorCode : 'send_rejected';

        return [
            'code' => $code,
            'message' => $message,
            'retryable' => $this->retryableFailure($code, $message),
        ];
    }

    private function hasExplicitSuccess(Response $response): bool
    {
        $json = $response->json();

        if (is_array($json)) {
            $status = data_get($json, 'success', data_get($json, 'ok', data_get($json, 'status')));

            return $status === true
                || $status === 1
                || $status === '1'
                || in_array(strtolower((string) $status), ['true', 'ok', 'success', 'successful', 'sent'], true);
        }

        return in_array(strtolower(trim($response->body())), ['true', 'ok', 'success', 'sent'], true);
    }

    private function messageId(Response $response): ?string
    {
        $json = $response->json();

        if (is_array($json)) {
            foreach ([
                'sendID',
                'sendId',
                'send_id',
                'messageId',
                'message_id',
                'recId',
                'id',
                'result.sendID',
                'result.sendId',
                'result.send_id',
                'result.id',
                'data.sendID',
                'data.sendId',
                'data.send_id',
                'data.id',
            ] as $path) {
                $value = data_get($json, $path);

                if (is_scalar($value) && trim((string) $value) !== '' && (string) $value !== '0') {
                    return trim((string) $value);
                }
            }

            return null;
        }

        $body = trim($response->body(), " \t\n\r\0\x0B\"");

        return preg_match('/^\d+$/', $body) === 1 && trim($body, '0') !== '' ? $body : null;
    }

    private function responseMessage(Response $response): ?string
    {
        $json = $response->json();

        if (is_array($json)) {
            foreach (['message', 'error.message', 'error', 'description', 'detail'] as $path) {
                $value = data_get($json, $path);

                if (is_scalar($value) && trim((string) $value) !== '') {
                    return trim((string) $value);
                }
            }
        }

        $body = trim($response->body());

        return $body !== '' && strlen($body) <= 500 ? $body : null;
    }

    private function retryableFailure(string $code, string $message): bool
    {
        $value = strtolower($code.' '.$message);

        if (is_numeric($code) && ((int) $code === 408 || (int) $code === 429 || (int) $code >= 500)) {
            return true;
        }

        return str_contains($value, '429')
            || str_contains($value, 'rate')
            || str_contains($value, 'limit')
            || str_contains($value, 'timeout')
            || str_contains($value, 'temporary')
            || str_contains($value, 'server')
            || str_contains($value, 'connection');
    }

    /**
     * @return array<string, mixed>
     */
    private function responsePayload(Response $response, string $transport, ?int $patternId): array
    {
        $payload = [
            'transport' => $transport,
            'http_status' => $response->status(),
        ];

        if ($patternId !== null) {
            $payload['pattern_id'] = $patternId;
        }

        $json = $response->json();

        if (is_array($json)) {
            $payload['response'] = $json;
        } elseif (trim($response->body()) !== '') {
            $payload['response'] = mb_substr(trim($response->body()), 0, 1000);
        }

        return $payload;
    }
}
