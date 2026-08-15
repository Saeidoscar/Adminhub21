<?php

namespace App\Services\ExternalServices\ApiIr;

use App\Models\ExternalServiceRequest;
use App\Services\ExternalServices\Exceptions\ExternalServiceException;
use App\Services\ExternalServices\OptionServiceSettings;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use JsonException;

class ApiIrClient
{
    private const PROVIDER = 'api_ir';

    public function __construct(
        private readonly OptionServiceSettings $settings,
    ) {}

    public function available(string $featureKey): bool
    {
        return $this->settings->enabled('api_ir_enabled')
            && $this->settings->enabled($featureKey, true)
            && filled($this->settings->string('api_ir_base_url'))
            && filled($this->settings->string('api_ir_api_key'));
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function post(
        string $service,
        string $endpoint,
        array $payload,
        ?int $userId = null,
    ): ApiIrResponse {
        $baseUrl = $this->settings->string('api_ir_base_url');
        $apiKey = $this->settings->string('api_ir_api_key');

        if (blank($baseUrl) || blank($apiKey)) {
            throw new ExternalServiceException(
                message: 'تنظیمات سرویس API.ir کامل نیست.',
                provider: self::PROVIDER,
                service: $service,
                errorCode: 'provider_not_configured',
                retryable: false,
            );
        }

        $log = ExternalServiceRequest::query()->create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $userId,
            'provider' => self::PROVIDER,
            'service' => $service,
            'status' => 'pending',
            'request_fingerprint' => hash_hmac(
                'sha256',
                $this->canonicalJson($payload),
                (string) config('app.key'),
            ),
            'request_payload' => $this->sanitizePayload($payload, redactOtpCode: true),
            'billable' => false,
        ]);

        $startedAt = hrtime(true);

        try {
            $response = Http::baseUrl(rtrim($baseUrl, '/'))
                ->acceptJson()
                ->asJson()
                ->withToken($apiKey)
                ->connectTimeout(max(1, min(10, $this->settings->integer('api_ir_connect_timeout_seconds', 5))))
                ->timeout(max(1, $this->settings->integer('api_ir_timeout_seconds', 15)))
                ->post('/'.ltrim($endpoint, '/'), $payload);
        } catch (ConnectionException $exception) {
            $this->markFailed(
                log: $log,
                startedAt: $startedAt,
                errorCode: 'connection_error',
                message: 'ارتباط با API.ir برقرار نشد.',
                retryable: true,
            );

            throw $this->technicalException(
                log: $log,
                message: 'ارتباط با سرویس استعلام برقرار نشد؛ دوباره تلاش کنید.',
                service: $service,
                errorCode: 'connection_error',
                retryable: true,
                previous: $exception,
            );
        }

        return $this->mapResponse($response, $service, $log, $startedAt);
    }

    public function markBusinessRejection(ApiIrResponse $response): void
    {
        ExternalServiceRequest::query()
            ->whereKey($response->requestId)
            ->update([
                'status' => 'rejected',
                'retryable' => false,
                'billable' => true,
            ]);
    }

    public function rejectUnusableResponse(
        ApiIrResponse $response,
        string $service,
        string $message = 'پاسخ سرویس استعلام ناقص یا غیرقابل اعتماد است.',
    ): never {
        $log = ExternalServiceRequest::query()->find($response->requestId);

        if ($log !== null) {
            $log->forceFill([
                'status' => 'failed',
                'provider_message' => $message,
                'retryable' => true,
                'billable' => false,
            ])->save();
        }

        throw $this->technicalException(
            log: $log,
            message: $message,
            service: $service,
            errorCode: 'invalid_provider_response',
            retryable: true,
        );
    }

    private function mapResponse(
        Response $response,
        string $service,
        ExternalServiceRequest $log,
        int $startedAt,
    ): ApiIrResponse {
        try {
            $payload = $response->json();
        } catch (JsonException) {
            $payload = null;
        }

        if (is_array($payload)) {
            $payload = $this->normalizeResponsePayload($payload);
        }

        if (! is_array($payload) || ! array_key_exists('success', $payload) || ! is_bool($payload['success'])) {
            $this->markFailed(
                log: $log,
                startedAt: $startedAt,
                errorCode: 'invalid_response',
                message: 'پاسخ API.ir قابل پردازش نیست.',
                retryable: true,
                httpStatus: $response->status(),
            );

            throw $this->technicalException(
                log: $log,
                message: 'پاسخ سرویس استعلام قابل پردازش نیست.',
                service: $service,
                errorCode: 'invalid_response',
                retryable: true,
            );
        }

        $providerCode = is_numeric($payload['code'] ?? null)
            ? (int) $payload['code']
            : null;
        $providerMessage = is_string($payload['message'] ?? null)
            ? trim($payload['message'])
            : null;
        $successful = $payload['success'] === true;
        $retryable = $this->retryableHttpStatus($response->status())
            || $this->retryableProviderCode($providerCode);
        $technicalFailure = $this->nonBillableHttpStatus($response->status())
            || (! $successful && $this->nonBillableProviderCode($providerCode))
            || (! $successful && $providerCode === null && ($payload['data'] ?? null) === null);
        $billable = ! $technicalFailure;

        $log->forceFill([
            'status' => $technicalFailure
                ? 'failed'
                : ($successful ? 'succeeded' : 'rejected'),
            'http_status' => $response->status(),
            'provider_code' => $providerCode,
            'provider_message' => $providerMessage,
            'response_payload' => $this->sanitizePayload($payload, redactOtpCode: false),
            'duration_ms' => $this->durationMs($startedAt),
            'retryable' => $technicalFailure && $retryable,
            'billable' => $billable,
            'responded_at' => now(),
        ])->save();

        if ($technicalFailure) {
            throw $this->technicalException(
                log: $log,
                message: $providerMessage ?: 'API.ir در حال حاضر پاسخ قابل استفاده‌ای ارائه نکرد.',
                service: $service,
                errorCode: $providerCode === null ? 'http_'.$response->status() : (string) $providerCode,
                retryable: $retryable,
            );
        }

        return new ApiIrResponse(
            successful: $successful,
            code: $providerCode,
            message: $providerMessage,
            data: $payload['data'] ?? null,
            httpStatus: $response->status(),
            payload: $payload,
            requestId: $log->id,
            requestUuid: $log->uuid,
            billable: $billable,
        );
    }


    /**
     * API.ir currently returns a mix of camelCase and PascalCase response keys.
     * Normalize both formats before applying billing and business rules.
     *
     * @param  array<array-key, mixed>  $payload
     * @return array<array-key, mixed>
     */
    private function normalizeResponsePayload(array $payload): array
    {
        $normalized = [];

        foreach ($payload as $key => $value) {
            $normalizedKey = is_string($key)
                ? $this->normalizeResponseKey($key)
                : $key;

            $normalized[$normalizedKey] = is_array($value)
                ? $this->normalizeResponsePayload($value)
                : $value;
        }

        return $normalized;
    }

    private function normalizeResponseKey(string $key): string
    {
        return match (strtolower($key)) {
            'success' => 'success',
            'code' => 'code',
            'message' => 'message',
            'data' => 'data',
            'nationalcode' => 'nationalCode',
            'firstname' => 'firstName',
            'lastname' => 'lastName',
            'fathername' => 'fatherName',
            'birthdate' => 'birthDate',
            'birthdatepersian' => 'birthDatePersian',
            'imagebase64' => 'imageBase64',
            default => lcfirst($key),
        };
    }

    private function markFailed(
        ExternalServiceRequest $log,
        int $startedAt,
        string $errorCode,
        string $message,
        bool $retryable,
        ?int $httpStatus = null,
    ): void {
        $log->forceFill([
            'status' => 'failed',
            'http_status' => $httpStatus,
            'provider_message' => $message,
            'response_payload' => ['error_code' => $errorCode],
            'duration_ms' => $this->durationMs($startedAt),
            'retryable' => $retryable,
            'billable' => false,
            'responded_at' => now(),
        ])->save();
    }

    private function technicalException(
        ?ExternalServiceRequest $log,
        string $message,
        string $service,
        string $errorCode,
        bool $retryable,
        ?\Throwable $previous = null,
    ): ExternalServiceException {
        return new ExternalServiceException(
            message: $message,
            provider: self::PROVIDER,
            service: $service,
            errorCode: $errorCode,
            retryable: $retryable,
            context: $log === null ? [] : [
                'external_request' => $this->requestSnapshot($log),
            ],
            previous: $previous,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function requestSnapshot(ExternalServiceRequest $log): array
    {
        $log->refresh();

        return [
            'uuid' => $log->uuid,
            'user_id' => $log->user_id,
            'provider' => $log->provider,
            'service' => $log->service,
            'status' => $log->status,
            'http_status' => $log->http_status,
            'provider_code' => $log->provider_code,
            'provider_message' => $log->provider_message,
            'request_fingerprint' => $log->request_fingerprint,
            'request_payload' => $log->request_payload,
            'response_payload' => $log->response_payload,
            'duration_ms' => $log->duration_ms,
            'retryable' => $log->retryable,
            'billable' => false,
            'responded_at' => $log->responded_at,
        ];
    }

    private function retryableHttpStatus(int $status): bool
    {
        return $status === 408 || $status === 429 || $status >= 500;
    }

    private function nonBillableHttpStatus(int $status): bool
    {
        return in_array($status, $this->configuredCodes(
            'api_ir_non_billable_http_statuses',
            '401,403,404,405,408,429,500,502,503,504',
        ), true) || $status >= 500;
    }

    private function retryableProviderCode(?int $code): bool
    {
        return $code !== null && in_array($code, $this->configuredCodes(
            'api_ir_retryable_codes',
            '408,429,500,502,503,504',
        ), true);
    }

    private function nonBillableProviderCode(?int $code): bool
    {
        return $code !== null && in_array($code, $this->configuredCodes(
            'api_ir_non_billable_codes',
            '401,403,408,429,500,502,503,504',
        ), true);
    }

    /**
     * @return array<int, int>
     */
    private function configuredCodes(string $key, string $default): array
    {
        return collect(explode(',', (string) $this->settings->string($key, $default)))
            ->map(fn (string $value): int => (int) trim($value))
            ->filter(fn (int $value): bool => $value > 0)
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function sanitizePayload(array $payload, bool $redactOtpCode): array
    {
        $sanitized = [];

        foreach ($payload as $key => $value) {
            $normalizedKey = strtolower((string) $key);

            if (
                in_array($normalizedKey, ['apikey', 'api_key', 'token', 'authorization', 'imagebase64'], true)
                || ($redactOtpCode && $normalizedKey === 'code')
            ) {
                $sanitized[$key] = '[REDACTED]';

                continue;
            }

            if (is_array($value)) {
                $sanitized[$key] = $this->sanitizePayload($value, $redactOtpCode);

                continue;
            }

            if (! is_scalar($value) && $value !== null) {
                $sanitized[$key] = null;

                continue;
            }

            $sanitized[$key] = match ($normalizedKey) {
                'mobile', 'number' => $this->mask((string) $value, 4, 3),
                'nationalcode', 'national_id', 'nationalid' => $this->mask((string) $value, 3, 2),
                'iban' => $this->mask((string) $value, 4, 4),
                'birthdate', 'birth_date' => '[REDACTED]',
                'firstname', 'lastname', 'fathername', 'name' => '[REDACTED]',
                default => $value,
            };
        }

        return $sanitized;
    }

    private function mask(string $value, int $prefix, int $suffix): string
    {
        if (mb_strlen($value) <= $prefix + $suffix) {
            return str_repeat('*', mb_strlen($value));
        }

        return mb_substr($value, 0, $prefix)
            .str_repeat('*', mb_strlen($value) - $prefix - $suffix)
            .mb_substr($value, -$suffix);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function canonicalJson(array $payload): string
    {
        ksort($payload);

        return json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function durationMs(int $startedAt): int
    {
        return max(0, (int) round((hrtime(true) - $startedAt) / 1_000_000));
    }
}
