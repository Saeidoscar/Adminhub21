<?php

namespace App\Services\ExternalServices\ApiIr;

use App\Services\ExternalServices\Contracts\BankAccountVerificationProvider;
use App\Services\ExternalServices\Data\ExternalVerificationResult;
use App\Services\ExternalServices\OptionServiceSettings;

class ApiIrBankAccountVerificationProvider implements BankAccountVerificationProvider
{
    private const PROVIDER = 'api_ir';

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
        return $this->client->available('api_ir_bank_enabled');
    }

    public function verifyIbanOwnership(
        string $nationalCode,
        string $birthDate,
        string $iban,
        ?int $userId = null,
    ): ExternalVerificationResult {
        $service = 'bank.iban_match';
        $endpoint = $this->settings->string('api_ir_iban_match_endpoint', '/api/sw1/IbanMatch')
            ?? '/api/sw1/IbanMatch';
        $payload = [
            'nationalCode' => $nationalCode,
            'iban' => strtoupper($iban),
        ];

        if (! str_ends_with(strtolower($endpoint), 'ibanmatchpro')) {
            $payload['birthDate'] = str_replace('-', '/', $birthDate);
        }

        $response = $this->client->post(
            service: $service,
            endpoint: $endpoint,
            payload: $payload,
            userId: $userId,
        );

        if ($response->successful && ! is_bool($response->data)) {
            $this->client->rejectUnusableResponse($response, $service);
        }

        $matched = $response->successful && $response->data === true;

        return new ExternalVerificationResult(
            matched: $matched,
            provider: self::PROVIDER,
            service: $service,
            code: $response->code,
            message: $response->message,
            data: ['matched' => $matched],
            requestId: $response->requestId,
            requestUuid: $response->requestUuid,
            billable: $response->billable,
        );
    }
}
