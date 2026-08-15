<?php

namespace App\Services\Payments;

use App\Enums\PaymentGateway as PaymentGatewayEnum;
use App\Models\WalletTransactionPayment;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class ZibalPaymentGateway implements PaymentGateway
{
    private const OWNERSHIP_METHOD = 'zibal_request_national_code';

    public function __construct(private OptionPaymentSettings $settings) {}

    public function name(): string
    {
        return PaymentGatewayEnum::Zibal->value;
    }

    public function initiate(int $amount, string $callbackUrl, array $metadata = []): PaymentGatewayInitiation
    {
        if (! $this->settings->enabled('payment_zibal_enabled', true)) {
            throw new PaymentGatewayException('Zibal gateway is disabled.', false);
        }

        $merchant = $this->settings->string('payment_zibal_merchant');
        $requestUrl = $this->settings->string('payment_zibal_request_url');
        $startUrl = $this->settings->string('payment_zibal_start_url', 'https://gateway.zibal.ir/start');

        if ($merchant === null || $requestUrl === null) {
            throw new PaymentGatewayException('Zibal gateway options are incomplete.', false);
        }

        $ownershipRequired = ($metadata['enforceCardOwnerNationalCode'] ?? false) === true;
        $nationalCode = $this->nationalCode($metadata['nationalCode'] ?? null);
        $mobile = $this->stringOrNull($metadata['mobile'] ?? null);

        if ($ownershipRequired && $nationalCode === null) {
            throw new PaymentGatewayException(
                'Zibal card-owner verification requires a valid national code.',
                false,
                ['failure_reason' => 'identity_snapshot_missing'],
            );
        }

        $request = [
            'merchant' => $merchant,
            'amount' => $this->tomanToRial($amount),
            'callbackUrl' => $callbackUrl,
            'orderId' => isset($metadata['payment_id']) ? (string) $metadata['payment_id'] : null,
            'description' => $metadata['description'] ?? 'Dadline wallet charge',
        ];

        if ($mobile !== null) {
            $request['mobile'] = $mobile;
        }

        // Zibal prevents payment when the payer card owner does not match this
        // national code. It is intentionally enabled only for level-three KYC.
        if ($ownershipRequired) {
            $request['nationalCode'] = $nationalCode;
        }

        if (($metadata['checkMobileWithCard'] ?? false) === true) {
            $request['checkMobileWithCard'] = true;
        }

        if (is_array($metadata['allowedCards'] ?? null) && $metadata['allowedCards'] !== []) {
            $request['allowedCards'] = array_values($metadata['allowedCards']);
        }

        $response = Http::timeout(12)->post($requestUrl, $request);

        if (! $response->ok()) {
            throw $this->httpFailure('Zibal request failed.', $response);
        }

        $payload = $response->json();
        $payload = is_array($payload) ? $payload : [];
        $trackId = $payload['trackId'] ?? null;

        if ((int) ($payload['result'] ?? 0) !== 100 || $trackId === null) {
            throw new PaymentGatewayException(
                'Zibal did not create a payment token. '.$this->failureDetails($payload),
                false,
                [
                    'gateway_payload' => $payload,
                    'failure_reason' => 'token_not_created',
                ],
            );
        }

        return new PaymentGatewayInitiation(
            gateway: $this->name(),
            paymentUrl: rtrim($startUrl, '/').'/'.$trackId,
            token: (string) $trackId,
            authority: (string) $trackId,
            cardOwnerVerificationEnforced: $ownershipRequired,
            cardOwnerVerificationMethod: $ownershipRequired ? self::OWNERSHIP_METHOD : null,
            payload: $payload,
        );
    }

    public function verify(WalletTransactionPayment $payment, array $payload = []): PaymentVerificationResult
    {
        $merchant = $this->settings->string('payment_zibal_merchant');
        $verifyUrl = $this->settings->string('payment_zibal_verify_url');
        $storedTrackId = $this->stringOrNull($payment->gateway_token ?? $payment->authority);
        $callbackTrackId = $this->stringOrNull($payload['trackId'] ?? $payload['track_id'] ?? null);

        if (
            $storedTrackId !== null
            && $callbackTrackId !== null
            && ! hash_equals($storedTrackId, $callbackTrackId)
        ) {
            throw new PaymentGatewayException(
                'Zibal callback track id does not match the payment snapshot.',
                false,
                [
                    'failure_reason' => 'track_id_mismatch',
                    'stored_track_id' => $storedTrackId,
                    'callback_track_id' => $callbackTrackId,
                ],
            );
        }

        $trackId = $storedTrackId ?? $callbackTrackId;

        if ($merchant === null || $verifyUrl === null || $trackId === null) {
            throw new PaymentGatewayException(
                'Zibal verify options are incomplete.',
                false,
                ['failure_reason' => 'verify_snapshot_incomplete'],
            );
        }

        $response = Http::timeout(12)->post($verifyUrl, [
            'merchant' => $merchant,
            'trackId' => $trackId,
        ]);

        if (! $response->ok()) {
            throw $this->httpFailure('Zibal verify failed.', $response, [
                'expected_track_id' => $trackId,
            'verified_track_id' => $verifiedTrackId,
            ]);
        }

        $data = $response->json();
        $data = is_array($data) ? $data : [];
        $result = is_numeric($data['result'] ?? null) ? (int) $data['result'] : null;
        $message = $this->stringOrNull($data['message'] ?? null);
        $verifiedAmount = is_numeric($data['amount'] ?? null) ? (int) $data['amount'] : null;
        $expectedAmount = (int) (
            $payment->request_payload['expected_amount_rial']
            ?? $this->tomanToRial((int) $payment->amount)
        );
        $ownershipRequired = $this->ownershipRequired($payment);
        $ownershipWasEnforced = ($payment->request_payload['gateway_card_owner_verification_enforced'] ?? false) === true;
        $verifiedTrackId = $this->stringOrNull($data['trackId'] ?? $data['track_id'] ?? null);
        $validationErrors = [];
        $gatewaySuccessful = $result !== null && in_array($result, [100, 201], true);

        if (! $gatewaySuccessful) {
            $validationErrors[] = 'gateway_rejected';
        }

        if ($verifiedTrackId !== null && ! hash_equals($trackId, $verifiedTrackId)) {
            $validationErrors[] = 'verified_track_id_mismatch';
        }

        if ($ownershipRequired) {
            if (! $ownershipWasEnforced) {
                $validationErrors[] = 'ownership_check_not_requested';
            }

            if ($verifiedAmount === null) {
                $validationErrors[] = 'verified_amount_missing';
            } elseif ($verifiedAmount !== $expectedAmount) {
                $validationErrors[] = 'verified_amount_mismatch';
            }
        } elseif ($verifiedAmount !== null && $verifiedAmount !== 0 && $verifiedAmount !== $expectedAmount) {
            $validationErrors[] = 'verified_amount_mismatch';
        }

        $successful = $gatewaySuccessful && $validationErrors === [];
        $maskedCardNumber = $this->maskCardNumber($data['cardNumber'] ?? null);
        $safeData = $data;

        if (array_key_exists('cardNumber', $safeData)) {
            $safeData['cardNumber'] = $maskedCardNumber;
        }

        $audit = [
            'ownership_required' => $ownershipRequired,
            'ownership_requested_at_gateway' => $ownershipWasEnforced,
            'ownership_checked' => $ownershipRequired && $ownershipWasEnforced && $successful,
            'ownership_method' => $ownershipRequired ? self::OWNERSHIP_METHOD : null,
            'result_code' => $result,
            'result_message' => $message,
            'expected_amount_rial' => $expectedAmount,
            'verified_amount_rial' => $verifiedAmount,
            'track_id' => $trackId,
            'validation_errors' => $validationErrors,
        ];

        return new PaymentVerificationResult(
            successful: $successful,
            refNum: isset($data['refNumber']) ? (string) $data['refNumber'] : null,
            rrn: isset($data['refNumber']) ? (string) $data['refNumber'] : null,
            cardNumberMasked: $maskedCardNumber,
            verifiedAmountRial: $verifiedAmount,
            resultCode: $result,
            resultMessage: $message,
            ownershipChecked: $ownershipRequired && $ownershipWasEnforced && $successful,
            ownershipMethod: $ownershipRequired ? self::OWNERSHIP_METHOD : null,
            failureReason: $validationErrors[0] ?? null,
            payload: [
                ...$safeData,
                '_dadline_verification' => $audit,
            ],
        );
    }

    private function ownershipRequired(WalletTransactionPayment $payment): bool
    {
        return ($payment->request_payload['card_owner_verification_required'] ?? false) === true;
    }

    private function tomanToRial(int $amount): int
    {
        return $amount * 10;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function failureDetails(array $payload): string
    {
        return collect([
            'result' => $payload['result'] ?? null,
            'message' => $payload['message'] ?? null,
        ])
            ->filter(fn ($value): bool => $value !== null && $value !== '')
            ->map(fn ($value, string $key): string => $key.'='.$value)
            ->implode(' ');
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function httpFailure(string $message, Response $response, array $context = []): PaymentGatewayException
    {
        $responsePayload = $response->json();

        return new PaymentGatewayException(
            message: $message,
            retryable: $response->status() === 408
                || $response->status() === 429
                || $response->serverError(),
            context: [
                ...$context,
                'http_status' => $response->status(),
                'gateway_payload' => is_array($responsePayload)
                    ? $responsePayload
                    : ['body' => mb_substr($response->body(), 0, 1000)],
                'failure_reason' => 'gateway_http_error',
            ],
        );
    }

    private function nationalCode(mixed $value): ?string
    {
        $value = preg_replace('/\D+/', '', (string) $value);

        return is_string($value) && strlen($value) === 10 ? $value : null;
    }


    private function maskCardNumber(mixed $value): ?string
    {
        $value = $this->stringOrNull($value);

        if ($value === null || str_contains($value, '*')) {
            return $value;
        }

        $digits = preg_replace('/\D+/', '', $value);

        if (! is_string($digits) || strlen($digits) < 10) {
            return null;
        }

        return substr($digits, 0, 6).'******'.substr($digits, -4);
    }

    private function stringOrNull(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
