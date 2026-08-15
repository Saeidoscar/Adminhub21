<?php

namespace App\Services\ExternalServices\ApiIr;

use App\Services\ExternalServices\Contracts\IdentityVerificationProvider;
use App\Services\ExternalServices\Data\ExternalVerificationResult;
use App\Services\ExternalServices\Exceptions\ExternalServiceException;
use App\Services\ExternalServices\OptionServiceSettings;
use App\Support\PersianTextNormalizer;

class ApiIrIdentityVerificationProvider implements IdentityVerificationProvider
{
    private const PROVIDER = 'api_ir';

    private const LEVEL_ONE_SERVICE = 'identity.level_one';

    public function __construct(
        private readonly ApiIrClient $client,
        private readonly OptionServiceSettings $settings,
    ) {}

    public function name(): string
    {
        return self::PROVIDER;
    }

    public function available(): bool
    {
        return $this->client->available('api_ir_identity_enabled');
    }

    public function verifyLevelOne(
        string $nationalCode,
        string $mobile,
        ?int $userId = null,
    ): ExternalVerificationResult {
        $liteEnabled = $this->settings->enabled('api_ir_level_one_lite_enabled', true);
        $proEnabled = $this->settings->enabled('api_ir_level_one_pro_enabled', true);

        $liteFailure = null;

        if ($liteEnabled) {
            try {
                return $this->verifyLevelOneWithEndpoint(
                    endpoint: $this->settings->string(
                        'api_ir_level_one_lite_endpoint',
                        '/api/sw1/ShahkarLite',
                    ) ?? '/api/sw1/ShahkarLite',
                    providerService: 'identity.level_one.shahkar_lite',
                    nationalCode: $nationalCode,
                    mobile: $mobile,
                    userId: $userId,
                    includeCompanyFlag: false,
                    source: 'shahkar_lite',
                );
            } catch (ExternalServiceException $exception) {
                if (! $proEnabled) {
                    throw $exception;
                }

                // Business mismatches are returned as normal billable results.
                // Only technical/provider failures reach this catch and may fall back.
                $liteFailure = $exception;
            }
        }

        if ($proEnabled) {
            try {
                return $this->verifyLevelOneWithEndpoint(
                    endpoint: $this->settings->string(
                        'api_ir_level_one_pro_endpoint',
                        '/api/sw1/ShahkarPro',
                    ) ?? '/api/sw1/ShahkarPro',
                    providerService: 'identity.level_one.shahkar_pro',
                    nationalCode: $nationalCode,
                    mobile: $mobile,
                    userId: $userId,
                    includeCompanyFlag: true,
                    source: 'shahkar_pro',
                );
            } catch (ExternalServiceException $proFailure) {
                if ($liteFailure !== null) {
                    throw $this->combineTechnicalFailures($liteFailure, $proFailure);
                }

                throw $proFailure;
            }
        }

        throw new ExternalServiceException(
            message: 'هیچ سرویس فعالی برای احراز هویت سطح ۱ تنظیم نشده است.',
            provider: self::PROVIDER,
            service: self::LEVEL_ONE_SERVICE,
            errorCode: 'provider_unavailable',
            retryable: false,
        );
    }

    private function combineTechnicalFailures(
        ExternalServiceException $liteFailure,
        ExternalServiceException $proFailure,
    ): ExternalServiceException {
        $snapshots = collect([
            ...$this->externalRequestSnapshots($liteFailure),
            ...$this->externalRequestSnapshots($proFailure),
        ])
            ->filter(fn (mixed $snapshot): bool => is_array($snapshot) && filled($snapshot['uuid'] ?? null))
            ->unique(fn (array $snapshot): string => (string) $snapshot['uuid'])
            ->values()
            ->all();

        return new ExternalServiceException(
            message: $proFailure->getMessage(),
            provider: $proFailure->provider,
            service: $proFailure->service,
            errorCode: $proFailure->errorCode,
            retryable: $proFailure->retryable,
            context: [
                ...$proFailure->context,
                'external_requests' => $snapshots,
            ],
            previous: $proFailure,
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function externalRequestSnapshots(ExternalServiceException $exception): array
    {
        $snapshots = [];
        $multiple = $exception->context['external_requests'] ?? null;
        $single = $exception->context['external_request'] ?? null;

        if (is_array($multiple)) {
            foreach ($multiple as $snapshot) {
                if (is_array($snapshot)) {
                    $snapshots[] = $snapshot;
                }
            }
        }

        if (is_array($single)) {
            $snapshots[] = $single;
        }

        return $snapshots;
    }

    public function verifyLevelTwo(
        string $nationalCode,
        string $birthDate,
        ?int $userId = null,
    ): ExternalVerificationResult {
        $service = 'identity.level_two';
        $response = $this->client->post(
            service: $service,
            endpoint: $this->settings->string('api_ir_level_two_endpoint', '/api/sw1/PersonInfo') ?? '/api/sw1/PersonInfo',
            payload: [
                'nationalCode' => $nationalCode,
                'birthDate' => $this->formatBirthDateForApiIr($birthDate),
            ],
            userId: $userId,
        );

        if (! $response->successful) {
            return new ExternalVerificationResult(
                matched: false,
                provider: self::PROVIDER,
                service: $service,
                code: $response->code,
                message: $response->message,
                requestId: $response->requestId,
                requestUuid: $response->requestUuid,
                billable: $response->billable,
            );
        }

        if (
            ($response->data === null || $response->data === false)
            && $this->isDefinitiveMismatchMessage($response->message)
        ) {
            $this->client->markBusinessRejection($response);

            return new ExternalVerificationResult(
                matched: false,
                provider: self::PROVIDER,
                service: $service,
                code: $response->code,
                message: $response->message,
                data: ['matched' => false],
                requestId: $response->requestId,
                requestUuid: $response->requestUuid,
                billable: $response->billable,
            );
        }

        if (! is_array($response->data) || $response->data === []) {
            $this->client->rejectUnusableResponse($response, $service);
        }

        $data = $response->data;
        $returnedNationalCode = preg_replace('/\D+/', '', (string) ($data['nationalCode'] ?? ''));
        $alive = $data['alive'] ?? null;

        if (
            $returnedNationalCode === ''
            || ! hash_equals($nationalCode, $returnedNationalCode)
            || ! is_bool($alive)
        ) {
            $this->client->rejectUnusableResponse(
                $response,
                $service,
                'پاسخ ثبت احوال فاقد کد ملی یا وضعیت حیات معتبر است.',
            );
        }

        $matched = $alive === true;

        if (
            $matched
            && (
                PersianTextNormalizer::normalizeName((string) ($data['firstName'] ?? '')) === ''
                || PersianTextNormalizer::normalizeName((string) ($data['lastName'] ?? '')) === ''
            )
        ) {
            $this->client->rejectUnusableResponse(
                $response,
                $service,
                'پاسخ ثبت احوال فاقد نام یا نام خانوادگی معتبر است.',
            );
        }

        return new ExternalVerificationResult(
            matched: $matched,
            provider: self::PROVIDER,
            service: $service,
            code: $response->code,
            message: $response->message,
            data: $data,
            requestId: $response->requestId,
            requestUuid: $response->requestUuid,
            billable: $response->billable,
        );
    }


    private function formatBirthDateForApiIr(string $birthDate): string
    {
        $parts = preg_split('/[-\/]/', trim($birthDate));

        if (
            ! is_array($parts)
            || count($parts) !== 3
            || collect($parts)->contains(fn (string $part): bool => ! ctype_digit($part))
        ) {
            return str_replace('-', '/', trim($birthDate));
        }

        [$year, $month, $day] = array_map('intval', $parts);

        return sprintf('%04d/%d/%d', $year, $month, $day);
    }

    private function isDefinitiveMismatchMessage(?string $message): bool
    {
        if (blank($message)) {
            return false;
        }

        $normalized = str_replace(
            ['ي', 'ى', 'ك', '‌'],
            ['ی', 'ی', 'ک', ' '],
            mb_strtolower(trim($message)),
        );

        return str_contains($normalized, 'عدم تطابق')
            || str_contains($normalized, 'مطابقت ندارد')
            || str_contains($normalized, 'نامنطبق');
    }

    private function verifyLevelOneWithEndpoint(
        string $endpoint,
        string $providerService,
        string $nationalCode,
        string $mobile,
        ?int $userId,
        bool $includeCompanyFlag,
        string $source,
    ): ExternalVerificationResult {
        $payload = [
            'nationalCode' => $nationalCode,
            'mobile' => $mobile,
        ];

        if ($includeCompanyFlag) {
            $payload['isCompany'] = false;
        }

        $response = $this->client->post(
            service: $providerService,
            endpoint: $endpoint,
            payload: $payload,
            userId: $userId,
        );

        if ($response->successful && ! is_bool($response->data)) {
            $this->client->rejectUnusableResponse($response, $providerService);
        }

        $matched = $response->successful && $response->data === true;

        return new ExternalVerificationResult(
            matched: $matched,
            provider: self::PROVIDER,
            service: self::LEVEL_ONE_SERVICE,
            code: $response->code,
            message: $response->message,
            data: [
                'matched' => $matched,
                'source' => $source,
            ],
            requestId: $response->requestId,
            requestUuid: $response->requestUuid,
            billable: $response->billable,
        );
    }
}
