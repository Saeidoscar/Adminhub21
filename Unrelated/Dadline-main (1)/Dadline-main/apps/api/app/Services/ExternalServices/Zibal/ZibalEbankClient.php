<?php

namespace App\Services\ExternalServices\Zibal;

use App\Services\ExternalServices\OptionServiceSettings;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class ZibalEbankClient
{
    public function __construct(private readonly OptionServiceSettings $settings) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createCheckout(array $payload): array
    {
        return $this->request('post', '/ebank/v1/account/checkout/create/', $payload);
    }

    /**
     * @return array<string, mixed>
     */
    public function inquireCheckout(string $uniqueCode, ?string $trackerId = null): array
    {
        $query = [
            'accountId' => $this->accountId(),
        ];

        if ($trackerId !== null && $trackerId !== '') {
            $query['trackerId'] = $trackerId;
        } else {
            $query['uniqueCode'] = $uniqueCode;
        }

        return $this->request('get', '/ebank/v1/account/checkout/inquire/', $query);
    }

    public function ensureConfigured(): void
    {
        if (! $this->settings->enabled('zibal_ebank_enabled', false)) {
            throw new ZibalEbankException('Zibal EBank service is disabled.', false);
        }

        if ($this->settings->string('zibal_ebank_access_token') === null) {
            throw new ZibalEbankException('Zibal EBank access token is not configured.', false);
        }

        $this->accountId();
    }

    public function accountId(): string
    {
        $accountId = $this->settings->string('zibal_ebank_account_id');

        if ($accountId === null) {
            throw new ZibalEbankException('Zibal EBank account ID is not configured.', false);
        }

        return $accountId;
    }

    public function reasonCode(): int
    {
        return $this->settings->integer('zibal_ebank_reason_code', 4);
    }

    public function callbackUrl(): ?string
    {
        return $this->settings->string('zibal_ebank_callback_url');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function request(string $method, string $path, array $data): array
    {
        $this->ensureConfigured();

        $token = $this->settings->string('zibal_ebank_access_token');

        if ($token === null) {
            throw new ZibalEbankException('Zibal EBank access token is not configured.', false);
        }

        try {
            $request = $this->http($token);
            $response = $method === 'get'
                ? $request->get($path, $data)
                : $request->post($path, $data);
        } catch (ConnectionException $exception) {
            throw new ZibalEbankException(
                'Unable to connect to Zibal EBank.',
                true,
                previous: $exception,
            );
        }

        return $this->parseResponse($response);
    }

    private function http(string $token): PendingRequest
    {
        $baseUrl = rtrim(
            $this->settings->string('zibal_ebank_base_url', 'https://api.zibal.ir') ?? 'https://api.zibal.ir',
            '/',
        );
        $timeout = max(5, $this->settings->integer('zibal_ebank_timeout_seconds', 15));

        return Http::baseUrl($baseUrl)
            ->acceptJson()
            ->asJson()
            ->withToken($token)
            ->connectTimeout(min(5, $timeout))
            ->timeout($timeout);
    }

    /**
     * @return array<string, mixed>
     */
    private function parseResponse(Response $response): array
    {
        $payload = $response->json();
        $payload = is_array($payload) ? $payload : [];
        $result = isset($payload['result']) && is_numeric($payload['result'])
            ? (int) $payload['result']
            : null;

        if ($response->successful() && ($result === null || $result === 1)) {
            return $payload;
        }

        $message = trim((string) ($payload['message'] ?? 'Zibal EBank request failed.'));
        $retryable = $response->serverError()
            || in_array($response->status(), [408, 425, 429], true)
            || in_array($result, [14, 45], true);

        throw new ZibalEbankException(
            $message === '' ? 'Zibal EBank request failed.' : $message,
            $retryable,
            $result,
            $payload,
        );
    }
}
