<?php

namespace App\Services\Notifications\Providers;

use App\Models\NotificationDelivery;
use App\Models\NotificationTemplate;
use App\Services\ExternalServices\OptionServiceSettings;
use App\Services\Notifications\Contracts\SmsProvider;
use App\Services\Notifications\Data\ProviderSendResult;
use App\Services\Notifications\SmsProviderSelection;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Throwable;

class MeliPayamakPatternProvider implements SmsProvider
{
    private const PROVIDER = SmsProviderSelection::MELIPAYAMAK;

    private const DEFAULT_ENDPOINT = 'http://api.payamak-panel.com/post/Send.asmx';

    private const SOAP_ACTION = 'http://tempuri.org/SendByBaseNumber';

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
        if (! $this->settings->enabled('melipayamak_enabled') || ! $this->selection->allows(self::PROVIDER)) {
            return false;
        }

        if ($this->isOtp($delivery) && ! $this->selection->otpPatternFallbackEnabled()) {
            return false;
        }

        return filled($delivery->recipient);
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        $username = $this->username();
        $credential = $this->credential();
        $recipient = $this->normalizeMobile((string) $delivery->recipient);
        $bodyId = $this->bodyId($delivery);

        if (blank($username) || blank($credential)) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'provider_not_configured',
                errorMessage: 'نام کاربری و API Key ملی‌پیامک تنظیم نشده است.',
                retryable: false,
            );
        }

        if ($recipient === null) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'invalid_recipient',
                errorMessage: 'شماره موبایل گیرنده برای ارسال ملی‌پیامک معتبر نیست.',
                retryable: false,
            );
        }

        if ($bodyId === null) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'pattern_not_configured',
                errorMessage: 'کد پترن ملی‌پیامک برای این قالب تنظیم نشده است.',
                retryable: false,
            );
        }

        $arguments = $this->patternArguments($delivery);

        if ($arguments instanceof ProviderSendResult) {
            return $arguments;
        }

        $endpoint = $this->settings->string('melipayamak_send_by_base_number_url', self::DEFAULT_ENDPOINT)
            ?? self::DEFAULT_ENDPOINT;

        try {
            $response = Http::connectTimeout(max(1, $this->settings->integer('melipayamak_connect_timeout_seconds', 5)))
                ->timeout(max(1, $this->settings->integer('melipayamak_timeout_seconds', 20)))
                ->withHeaders([
                    'Accept' => 'text/xml, application/soap+xml',
                    'SOAPAction' => '"'.self::SOAP_ACTION.'"',
                ])
                ->withBody(
                    $this->soapEnvelope(
                        username: $username,
                        credential: $credential,
                        arguments: $arguments,
                        recipient: $recipient,
                        bodyId: $bodyId,
                    ),
                    'text/xml; charset=UTF-8',
                )
                ->post($endpoint);
        } catch (ConnectionException $exception) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'connection_error',
                errorMessage: 'ارتباط با وب‌سرویس ملی‌پیامک برقرار نشد.',
                retryable: true,
                payload: ['exception' => $exception->getMessage()],
            );
        } catch (Throwable $exception) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'provider_exception',
                errorMessage: $exception->getMessage(),
                retryable: true,
            );
        }

        if (! $response->successful()) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'http_'.$response->status(),
                errorMessage: 'وب‌سرویس ملی‌پیامک پاسخ HTTP معتبر برنگرداند.',
                retryable: $response->status() === 408
                    || $response->status() === 429
                    || $response->serverError(),
                payload: ['http_status' => $response->status()],
            );
        }

        $providerValue = $this->responseValue($response->body());

        if ($providerValue === null) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: 'invalid_response',
                errorMessage: 'پاسخ وب‌سرویس ملی‌پیامک قابل خواندن نبود.',
                retryable: true,
                payload: ['http_status' => $response->status()],
            );
        }

        if (preg_match('/^\d{16,}$/', $providerValue) === 1) {
            return ProviderSendResult::sent(
                provider: self::PROVIDER,
                messageId: $providerValue,
                payload: [
                    'body_id' => $bodyId,
                    'variables_count' => count($arguments),
                    'http_status' => $response->status(),
                ],
            );
        }

        $code = $this->normalizeProviderCode($providerValue);

        return ProviderSendResult::failed(
            provider: self::PROVIDER,
            errorCode: $code,
            errorMessage: $this->errorMessage($code),
            retryable: in_array($code, ['-6', '6', '11', '19'], true),
            payload: [
                'body_id' => $bodyId,
                'provider_response' => $providerValue,
                'http_status' => $response->status(),
            ],
        );
    }

    private function isOtp(NotificationDelivery $delivery): bool
    {
        $templateKey = $this->templateKey($delivery);

        return str_contains($templateKey, 'otp');
    }

    private function templateKey(NotificationDelivery $delivery): string
    {
        return (string) ($delivery->notification?->template_key
            ?? $delivery->notification()->value('template_key'));
    }

    private function bodyId(NotificationDelivery $delivery): ?int
    {
        $value = data_get($delivery->provider_payload, 'patterns.'.self::PROVIDER.'.id');

        return is_numeric($value) && (int) $value > 0 ? (int) $value : null;
    }

    /**
     * @return array<int, string>|ProviderSendResult
     */
    private function patternArguments(NotificationDelivery $delivery): array|ProviderSendResult
    {
        $configuredVariables = data_get(
            $delivery->provider_payload,
            'patterns.'.self::PROVIDER.'.variables',
        );

        $variables = is_array($configuredVariables)
            ? array_values($configuredVariables)
            : $this->templateVariables($delivery);

        $arguments = [];

        foreach ($variables as $variable) {
            $key = trim((string) $variable);

            if ($key === '' || ! array_key_exists($key, $delivery->payload ?? [])) {
                return ProviderSendResult::failed(
                    provider: self::PROVIDER,
                    errorCode: 'missing_pattern_variable',
                    errorMessage: "متغیر {$key} برای پترن ملی‌پیامک مقداردهی نشده است.",
                    retryable: false,
                    payload: ['variable' => $key],
                );
            }

            $value = data_get($delivery->payload, $key);

            if (! is_scalar($value) && $value !== null) {
                return ProviderSendResult::failed(
                    provider: self::PROVIDER,
                    errorCode: 'invalid_pattern_variable',
                    errorMessage: "مقدار متغیر {$key} برای پترن ملی‌پیامک معتبر نیست.",
                    retryable: false,
                    payload: ['variable' => $key],
                );
            }

            $arguments[] = (string) $value;
        }

        return $arguments;
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

    private function username(): ?string
    {
        return $this->settings->string('melipayamak_username');
    }

    private function credential(): ?string
    {
        return $this->settings->string('melipayamak_api_key')
            ?? $this->settings->string('melipayamak_password');
    }

    /**
     * @param  array<int, string>  $arguments
     */
    private function soapEnvelope(
        string $username,
        string $credential,
        array $arguments,
        string $recipient,
        int $bodyId,
    ): string {
        $text = collect($arguments)
            ->map(fn (string $value): string => '<string>'.$this->xml($value).'</string>')
            ->implode('');

        return '<?xml version="1.0" encoding="utf-8"?>'
            .'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
            .'xmlns:xsd="http://www.w3.org/2001/XMLSchema" '
            .'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
            .'<soap:Body>'
            .'<SendByBaseNumber xmlns="http://tempuri.org/">'
            .'<username>'.$this->xml($username).'</username>'
            .'<password>'.$this->xml($credential).'</password>'
            .'<text>'.$text.'</text>'
            .'<to>'.$this->xml($recipient).'</to>'
            .'<bodyId>'.$bodyId.'</bodyId>'
            .'</SendByBaseNumber>'
            .'</soap:Body>'
            .'</soap:Envelope>';
    }

    private function xml(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    private function responseValue(string $xml): ?string
    {
        if (preg_match(
            '/<(?:[a-zA-Z0-9_]+:)?SendByBaseNumberResult(?:\s[^>]*)?>(.*?)<\/(?:[a-zA-Z0-9_]+:)?SendByBaseNumberResult>/s',
            $xml,
            $matches,
        ) !== 1) {
            return null;
        }

        return trim(html_entity_decode(strip_tags($matches[1]), ENT_QUOTES | ENT_XML1, 'UTF-8'));
    }

    private function normalizeProviderCode(string $value): string
    {
        if (preg_match('/^(\d+)-$/', $value, $matches) === 1) {
            return '-'.$matches[1];
        }

        return $value;
    }

    private function normalizeMobile(string $mobile): ?string
    {
        $digits = preg_replace('/\D+/', '', $mobile) ?? '';

        if (str_starts_with($digits, '0098')) {
            $digits = '0'.substr($digits, 4);
        } elseif (str_starts_with($digits, '98')) {
            $digits = '0'.substr($digits, 2);
        } elseif (strlen($digits) === 10 && str_starts_with($digits, '9')) {
            $digits = '0'.$digits;
        }

        return preg_match('/^09\d{9}$/', $digits) === 1 ? $digits : null;
    }

    private function errorMessage(string $code): string
    {
        return match ($code) {
            '-110' => 'ملی‌پیامک استفاده از API Key را به‌جای رمز عبور الزامی کرده است.',
            '-109' => 'IP مجاز برای استفاده از API ملی‌پیامک تنظیم نشده است.',
            '-108' => 'IP به‌دلیل تلاش ناموفق در API ملی‌پیامک مسدود شده است.',
            '-10' => 'وجود لینک در متغیرهای پترن توسط ملی‌پیامک رد شد.',
            '-7' => 'خطایی در شماره فرستنده ملی‌پیامک رخ داده است.',
            '-6' => 'خطای داخلی در سرویس ملی‌پیامک رخ داده است.',
            '-5' => 'متغیرهای ارسالی با متن پترن ملی‌پیامک همخوانی ندارد.',
            '-4' => 'کد پترن ملی‌پیامک معتبر یا تاییدشده نیست.',
            '-3' => 'خط ارسال‌کننده در ملی‌پیامک تعریف نشده است.',
            '-2' => 'در ارسال پترن ملی‌پیامک فقط یک گیرنده مجاز است.',
            '-1' => 'دسترسی وب‌سرویس ملی‌پیامک غیرفعال است.',
            '0' => 'نام کاربری یا رمز عبور/API Key ملی‌پیامک صحیح نیست.',
            '2' => 'اعتبار حساب ملی‌پیامک کافی نیست.',
            '6' => 'سامانه ملی‌پیامک در حال بروزرسانی است.',
            '7' => 'متن شامل کلمه فیلترشده در ملی‌پیامک است.',
            '10' => 'حساب کاربری ملی‌پیامک فعال نیست.',
            '11' => 'ارسال پیامک توسط ملی‌پیامک انجام نشد.',
            '12' => 'مدارک حساب ملی‌پیامک کامل نیست.',
            '16' => 'شماره گیرنده برای ملی‌پیامک یافت نشد.',
            '17' => 'متن پیامک خالی است.',
            '18' => 'شماره گیرنده در ملی‌پیامک نامعتبر است.',
            '19' => 'محدودیت ساعتی ملی‌پیامک رد شده است.',
            default => "ملی‌پیامک ارسال را با کد {$code} رد کرد.",
        };
    }
}
