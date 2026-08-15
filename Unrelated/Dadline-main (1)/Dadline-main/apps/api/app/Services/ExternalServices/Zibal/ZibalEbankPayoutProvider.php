<?php

namespace App\Services\ExternalServices\Zibal;

use App\Models\PayoutSettlement;
use App\Services\Settlements\Data\BankTransferResult;

class ZibalEbankPayoutProvider
{
    public const NAME = 'zibal_ebank';

    public function __construct(private readonly ZibalEbankClient $client) {}

    public function ensureConfigured(): void
    {
        $this->client->ensureConfigured();
    }

    public function submit(PayoutSettlement $settlement): BankTransferResult
    {
        $request = [
            'amount' => $this->tomanToRial($settlement->total_payable),
            'iban' => strtoupper($settlement->iban),
            'accountId' => $this->client->accountId(),
            'reasonCode' => $this->client->reasonCode(),
            'delay' => -1,
            'uniqueCode' => $settlement->unique_code,
            'description' => "تسویه حساب دادلاین #{$settlement->id}",
        ];

        if ($this->client->callbackUrl() !== null) {
            $request['callbackUrl'] = $this->client->callbackUrl();
        }

        try {
            return $this->map($this->client->createCheckout($request));
        } catch (ZibalEbankException $exception) {
            if (in_array($exception->resultCode, [2, 3, 4, 7, 8, 9, 21, 29], true)) {
                throw $exception;
            }

            try {
                return $this->inquire($settlement);
            } catch (ZibalEbankException) {
                throw new ZibalEbankException(
                    $exception->getMessage(),
                    true,
                    $exception->resultCode,
                    $exception->payload,
                    $exception,
                );
            }
        }
    }

    public function inquire(PayoutSettlement $settlement): BankTransferResult
    {
        return $this->map($this->client->inquireCheckout(
            $settlement->unique_code,
            $settlement->track_id,
        ));
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function fromWebhook(array $payload): BankTransferResult
    {
        return $this->map($payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function uniqueCodeFromPayload(array $payload): ?string
    {
        $data = $this->data($payload);
        $value = $data['uniqueCode'] ?? $data['unique_code'] ?? null;

        return is_scalar($value) && (string) $value !== '' ? (string) $value : null;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function trackerIdFromPayload(array $payload): ?string
    {
        $data = $this->data($payload);
        $value = $data['trackerId'] ?? $data['tracker_id'] ?? null;

        return is_scalar($value) && (string) $value !== '' ? (string) $value : null;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function map(array $payload): BankTransferResult
    {
        $data = $this->data($payload);
        $checkouts = $data['checkouts'] ?? [];
        $checkout = is_array($checkouts) ? ($checkouts[0] ?? []) : [];
        $checkout = is_array($checkout) ? $checkout : [];
        $status = isset($checkout['status']) && is_numeric($checkout['status'])
            ? (int) $checkout['status']
            : 0;

        return new BankTransferResult(
            status: $status,
            trackerId: $this->trackerIdFromPayload($payload),
            receiptLink: $this->stringValue($data['receipt'] ?? null),
            payload: $payload,
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function data(array $payload): array
    {
        $data = $payload['data'] ?? $payload;

        return is_array($data) ? $data : [];
    }

    private function stringValue(mixed $value): ?string
    {
        return is_scalar($value) && (string) $value !== '' ? (string) $value : null;
    }

    private function tomanToRial(int $amount): int
    {
        return $amount * 10;
    }
}
