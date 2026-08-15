<?php

namespace App\Services\Notifications\Providers;

use App\Models\NotificationDelivery;
use App\Services\ExternalServices\ApiIr\ApiIrClient;
use App\Services\ExternalServices\ApiIr\ApiIrResponse;
use App\Services\ExternalServices\Exceptions\ExternalServiceException;
use App\Services\ExternalServices\OptionServiceSettings;
use App\Services\Notifications\Contracts\CallProvider;
use App\Services\Notifications\Data\ProviderSendResult;

class ApiIrCallOtpProvider implements CallProvider
{
    private const PROVIDER = 'api_ir_call_otp';

    public function __construct(
        private readonly ApiIrClient $client,
        private readonly OptionServiceSettings $settings,
    ) {}

    public function name(): string
    {
        return self::PROVIDER;
    }

    public function supports(NotificationDelivery $delivery): bool
    {
        $templateKey = $delivery->notification?->template_key
            ?? $delivery->notification()->value('template_key');

        return $this->isCallOtpTemplate($templateKey)
            && $this->client->available('api_ir_call_otp_enabled')
            && filled($delivery->recipient)
            && filled($delivery->payload['code'] ?? null);
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        $payload = [
            'code' => (string) $delivery->payload['code'],
            'number' => (string) $delivery->recipient,
        ];

        try {
            $response = $this->client->post(
                service: 'otp.call',
                endpoint: $this->settings->string('api_ir_call_otp_endpoint', '/api/sw1/CallOTP') ?? '/api/sw1/CallOTP',
                payload: $payload,
                userId: $delivery->user_id,
            );
        } catch (ExternalServiceException $exception) {
            if (! $exception->retryable) {
                return $this->exceptionResult($exception);
            }

            return $this->sendThroughAlternateNetwork($delivery, $payload, $exception);
        }

        if ($response->successful && $response->data === true) {
            return $this->sentResult($delivery, $response, 'primary');
        }

        return $this->sendThroughAlternateNetwork(
            delivery: $delivery,
            payload: $payload,
            primaryResponse: $response,
        );
    }

    /**
     * @param  array<string, string>  $payload
     */
    private function sendThroughAlternateNetwork(
        NotificationDelivery $delivery,
        array $payload,
        ?ExternalServiceException $primaryException = null,
        ?ApiIrResponse $primaryResponse = null,
    ): ProviderSendResult {
        if (! $this->settings->enabled('api_ir_call_otp_alt_enabled', true)) {
            if ($primaryException !== null) {
                return $this->exceptionResult($primaryException);
            }

            return $primaryResponse !== null
                ? $this->rejectedResult($primaryResponse)
                : ProviderSendResult::failed(
                    provider: self::PROVIDER,
                    errorCode: 'primary_network_failed',
                    errorMessage: 'شبکه اصلی OTP تلفنی پاسخ موفق نداد.',
                    retryable: true,
                );
        }

        try {
            $response = $this->client->post(
                service: 'otp.call_alt',
                endpoint: $this->settings->string('api_ir_call_otp_alt_endpoint', '/api/sw1/CallOTPalt') ?? '/api/sw1/CallOTPalt',
                payload: $payload,
                userId: $delivery->user_id,
            );
        } catch (ExternalServiceException $exception) {
            return $this->exceptionResult($exception);
        }

        return $response->successful && $response->data === true
            ? $this->sentResult($delivery, $response, 'alternate')
            : $this->rejectedResult($response);
    }

    private function sentResult(
        NotificationDelivery $delivery,
        ApiIrResponse $response,
        string $network,
    ): ProviderSendResult {
        return ProviderSendResult::sent(
            provider: self::PROVIDER,
            messageId: 'api-ir-call-'.$delivery->id,
            payload: [
                'network' => $network,
                'provider_code' => $response->code,
                'provider_message' => $response->message,
            ],
        );
    }

    private function rejectedResult(ApiIrResponse $response): ProviderSendResult
    {
        return ProviderSendResult::failed(
            provider: self::PROVIDER,
            errorCode: $response->code === null ? 'send_rejected' : (string) $response->code,
            errorMessage: $response->message ?: 'API.ir ارسال OTP تلفنی را تایید نکرد.',
            retryable: $this->retryableCode($response->code),
            payload: ['provider_code' => $response->code],
        );
    }

    private function exceptionResult(ExternalServiceException $exception): ProviderSendResult
    {
        return ProviderSendResult::failed(
            provider: self::PROVIDER,
            errorCode: $exception->errorCode,
            errorMessage: $exception->getMessage(),
            retryable: $exception->retryable,
        );
    }

    private function isCallOtpTemplate(?string $templateKey): bool
    {
        return is_string($templateKey)
            && str_ends_with($templateKey, '.call')
            && str_contains($templateKey, 'otp');
    }

    private function retryableCode(?int $code): bool
    {
        if ($code === null) {
            return false;
        }

        return collect(explode(',', (string) $this->settings->string(
            'api_ir_retryable_codes',
            '408,429,500,502,503,504'
        )))
            ->map(fn (string $value): int => (int) trim($value))
            ->contains($code);
    }
}
