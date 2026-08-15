<?php

namespace App\Services\Notifications\Providers;

use App\Models\NotificationDelivery;
use App\Services\ExternalServices\ApiIr\ApiIrClient;
use App\Services\ExternalServices\Exceptions\ExternalServiceException;
use App\Services\ExternalServices\OptionServiceSettings;
use App\Services\Notifications\Contracts\SmsProvider;
use App\Services\Notifications\Data\ProviderSendResult;

class ApiIrSmsOtpProvider implements SmsProvider
{
    private const PROVIDER = 'api_ir_sms_otp';

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

        return $this->isSmsOtpTemplate($templateKey)
            && $this->client->available('api_ir_sms_otp_enabled')
            && filled($delivery->recipient)
            && filled($delivery->payload['code'] ?? null);
    }

    public function send(NotificationDelivery $delivery): ProviderSendResult
    {
        try {
            $response = $this->client->post(
                service: 'otp.sms',
                endpoint: $this->settings->string('api_ir_sms_otp_endpoint', '/api/sw1/SmsOTP') ?? '/api/sw1/SmsOTP',
                payload: [
                    'code' => (string) $delivery->payload['code'],
                    'mobile' => (string) $delivery->recipient,
                    'template' => max(0, $this->settings->integer('api_ir_sms_otp_template', 1)),
                ],
                userId: $delivery->user_id,
            );
        } catch (ExternalServiceException $exception) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: $exception->errorCode,
                errorMessage: $exception->getMessage(),
                retryable: $exception->retryable,
            );
        }

        if (! $response->successful || $response->data !== true) {
            return ProviderSendResult::failed(
                provider: self::PROVIDER,
                errorCode: $response->code === null ? 'send_rejected' : (string) $response->code,
                errorMessage: $response->message ?: 'API.ir ارسال OTP پیامکی را تایید نکرد.',
                retryable: $this->retryableCode($response->code),
                payload: ['provider_code' => $response->code],
            );
        }

        return ProviderSendResult::sent(
            provider: self::PROVIDER,
            messageId: 'api-ir-sms-'.$delivery->id,
            payload: [
                'provider_code' => $response->code,
                'provider_message' => $response->message,
            ],
        );
    }

    private function isSmsOtpTemplate(?string $templateKey): bool
    {
        return is_string($templateKey)
            && str_ends_with($templateKey, '.sms')
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
