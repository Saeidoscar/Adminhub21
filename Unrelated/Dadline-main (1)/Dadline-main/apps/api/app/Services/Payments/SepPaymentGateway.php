<?php

namespace App\Services\Payments;

use App\Enums\PaymentGateway as PaymentGatewayEnum;
use App\Models\WalletTransactionPayment;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class SepPaymentGateway implements PaymentGateway
{
    private const OWNERSHIP_METHOD = 'sep_verify_national_code';

    public function __construct(private OptionPaymentSettings $settings) {}

    public function name(): string
    {
        return PaymentGatewayEnum::Sep->value;
    }

    public function initiate(int $amount, string $callbackUrl, array $metadata = []): PaymentGatewayInitiation
    {
        if (! $this->settings->enabled('payment_sep_enabled', true)) {
            throw new PaymentGatewayException('SEP gateway is disabled.', false);
        }

        $requestUrl = $this->settings->string('payment_sep_request_url');
        $terminalId = $this->settings->string('payment_sep_terminal_id');

        if ($requestUrl === null || $terminalId === null) {
            throw new PaymentGatewayException('SEP gateway options are incomplete.', false);
        }

        $ownershipRequired = ($metadata['enforceCardOwnerNationalCode'] ?? false) === true;
        $nationalCode = $this->nationalCode($metadata['nationalCode'] ?? null);
        $mobile = $this->stringOrNull($metadata['mobile'] ?? null);

        if ($ownershipRequired && ($nationalCode === null || $mobile === null)) {
            throw new PaymentGatewayException(
                'SEP card-owner verification requires a valid national code and mobile number.',
                false,
                ['failure_reason' => 'identity_snapshot_missing'],
            );
        }

        $request = [
            'Action' => 'Token',
            'TerminalId' => $terminalId,
            'Amount' => $this->tomanToRial($amount),
            'RedirectUrl' => $callbackUrl,
            'ResNum' => isset($metadata['payment_id']) ? (string) $metadata['payment_id'] : null,
        ];

        if ($mobile !== null) {
            $request['CellNumber'] = $mobile;
        }

        // NationalCode is intentionally sent only for level-three bank identity
        // verification. Ordinary site payments must not be restricted by card owner.
        if ($ownershipRequired) {
            $request['NationalCode'] = $nationalCode;
        }

        $response = Http::timeout(12)->post($requestUrl, $request);

        if (! $response->ok()) {
            throw $this->httpFailure('SEP request failed.', $response);
        }

        $payload = $response->json();
        $payload = is_array($payload) ? $payload : [];
        $token = $payload['token'] ?? $payload['Token'] ?? null;

        if (! in_array((int) ($payload['status'] ?? $payload['Status'] ?? 0), [1], true) || $token === null) {
            throw new PaymentGatewayException(
                'SEP did not create a payment token. '.$this->failureDetails($payload),
                true,
                [
                    'gateway_payload' => $payload,
                    'failure_reason' => 'token_not_created',
                ],
            );
        }

        return new PaymentGatewayInitiation(
            gateway: $this->name(),
            paymentUrl: $requestUrl,
            token: (string) $token,
            authority: (string) $token,
            terminalId: $terminalId,
            cardOwnerVerificationEnforced: $ownershipRequired,
            cardOwnerVerificationMethod: $ownershipRequired ? self::OWNERSHIP_METHOD : null,
            payload: $payload,
        );
    }

    public function verify(WalletTransactionPayment $payment, array $payload = []): PaymentVerificationResult
    {
        $verifyUrl = $this->settings->string('payment_sep_verify_url');
        $terminalId = $this->stringOrNull($payment->terminal_id)
            ?? $this->settings->string('payment_sep_terminal_id');
        $refNum = $this->stringOrNull(
            $payload['RefNum'] ?? $payload['ref_num'] ?? $payload['refNum'] ?? $payment->ref_num,
        );
        $ownershipRequired = $this->ownershipRequired($payment);
        $nationalCode = $this->nationalCode($payment->request_payload['national_code'] ?? null);
        $mobile = $this->stringOrNull($payment->request_payload['mobile'] ?? null);

        if ($verifyUrl === null || $terminalId === null || $refNum === null) {
            throw new PaymentGatewayException(
                'SEP verify options are incomplete.',
                false,
                ['failure_reason' => 'verify_snapshot_incomplete'],
            );
        }

        if ($ownershipRequired && ($nationalCode === null || $mobile === null)) {
            throw new PaymentGatewayException(
                'SEP card-owner verification snapshot is incomplete.',
                false,
                ['failure_reason' => 'identity_snapshot_missing'],
            );
        }

        $verifyRequest = [
            'TerminalNumber' => $terminalId,
            'RefNum' => $refNum,
        ];

        if ($ownershipRequired) {
            $verifyRequest['CellNumber'] = $mobile;
            $verifyRequest['NationalCode'] = $nationalCode;
            $verifyRequest['IgnoreNationalcode'] = false;
        }

        $response = Http::timeout(12)->post($verifyUrl, $verifyRequest);

        if (! $response->ok()) {
            throw $this->httpFailure('SEP verify failed.', $response, [
                'verify_request' => $this->redactVerifyRequest($verifyRequest),
            ]);
        }

        $data = $response->json();
        $data = is_array($data) ? $data : [];

        return $this->verificationResult(
            payment: $payment,
            callbackRefNum: $refNum,
            expectedTerminalId: $terminalId,
            ownershipRequired: $ownershipRequired,
            data: $data,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function verificationResult(
        WalletTransactionPayment $payment,
        string $callbackRefNum,
        string $expectedTerminalId,
        bool $ownershipRequired,
        array $data,
    ): PaymentVerificationResult {
        $resultCode = $this->integerOrNull($this->first($data, [
            'ResultCode',
            'resultCode',
        ]));
        $resultMessage = $this->stringOrNull($this->first($data, [
            'ResultDescription',
            'resultDescription',
            'Message',
            'message',
        ]));
        $successFlag = $this->booleanOrNull($this->first($data, [
            'Success',
            'success',
        ]));
        $expectedAmountRial = (int) (
            $payment->request_payload['expected_amount_rial']
            ?? $this->tomanToRial((int) $payment->amount)
        );
        $verifiedAmountRial = $this->integerOrNull($this->first($data, [
            'TransactionDetail.OrginalAmount',
            'TransactionDetail.OriginalAmount',
            'TransactionDetail.AffectiveAmount',
            'transactionDetail.orginalAmount',
            'transactionDetail.originalAmount',
            'transactionDetail.affectiveAmount',
            'OrginalAmount',
            'OriginalAmount',
            'AffectiveAmount',
            'Amount',
            'amount',
        ]));

        if ($verifiedAmountRial === null && $resultCode === $expectedAmountRial) {
            $verifiedAmountRial = $resultCode;
        }

        $verifiedRefNum = $this->stringOrNull($this->first($data, [
            'TransactionDetail.RefNum',
            'transactionDetail.refNum',
            'RefNum',
            'refNum',
        ]));
        $verifiedTerminalId = $this->stringOrNull($this->first($data, [
            'TransactionDetail.TerminalNumber',
            'TransactionDetail.TerminalId',
            'transactionDetail.terminalNumber',
            'transactionDetail.terminalId',
            'TerminalNumber',
            'TerminalId',
        ]));
        $rrn = $this->stringOrNull($this->first($data, [
            'TransactionDetail.RRN',
            'transactionDetail.rrn',
            'RRN',
            'TraceNo',
        ]));
        $maskedPan = $this->stringOrNull($this->first($data, [
            'TransactionDetail.MaskedPan',
            'TransactionDetail.SecurePan',
            'transactionDetail.maskedPan',
            'transactionDetail.securePan',
            'MaskedPan',
            'SecurePan',
            'cardNumberMasked',
        ]));

        $gatewaySuccessful = $successFlag !== false
            && $resultCode !== null
            && in_array($resultCode, [0, $expectedAmountRial], true);
        $validationErrors = [];

        if (! $gatewaySuccessful) {
            $validationErrors[] = 'gateway_rejected';
        }

        if ($ownershipRequired) {
            if ($verifiedAmountRial === null) {
                $validationErrors[] = 'verified_amount_missing';
            } elseif ($verifiedAmountRial !== $expectedAmountRial) {
                $validationErrors[] = 'verified_amount_mismatch';
            }

            if ($verifiedRefNum === null) {
                $validationErrors[] = 'verified_ref_num_missing';
            } elseif (! hash_equals($callbackRefNum, $verifiedRefNum)) {
                $validationErrors[] = 'verified_ref_num_mismatch';
            }

            if ($verifiedTerminalId === null) {
                $validationErrors[] = 'verified_terminal_missing';
            } elseif (! hash_equals($expectedTerminalId, $verifiedTerminalId)) {
                $validationErrors[] = 'verified_terminal_mismatch';
            }
        }

        $successful = $gatewaySuccessful && $validationErrors === [];
        $maskedPan = $this->maskCardNumber($maskedPan);
        $safeData = $this->sanitizeCardPayload($data);
        $audit = [
            'ownership_required' => $ownershipRequired,
            'ownership_checked' => $ownershipRequired && $successful,
            'ownership_method' => $ownershipRequired ? self::OWNERSHIP_METHOD : null,
            'result_code' => $resultCode,
            'result_message' => $resultMessage,
            'expected_amount_rial' => $expectedAmountRial,
            'verified_amount_rial' => $verifiedAmountRial,
            'expected_ref_num' => $callbackRefNum,
            'verified_ref_num' => $verifiedRefNum,
            'expected_terminal_id' => $expectedTerminalId,
            'verified_terminal_id' => $verifiedTerminalId,
            'validation_errors' => $validationErrors,
        ];

        return new PaymentVerificationResult(
            successful: $successful,
            refNum: $verifiedRefNum ?? $callbackRefNum,
            rrn: $rrn,
            cardNumberMasked: $maskedPan,
            gatewayFee: (int) ($data['gatewayFee'] ?? 0),
            verifiedAmountRial: $verifiedAmountRial,
            terminalId: $verifiedTerminalId,
            resultCode: $resultCode,
            resultMessage: $resultMessage,
            ownershipChecked: $ownershipRequired && $successful,
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
            'status' => $payload['status'] ?? $payload['Status'] ?? null,
            'errorCode' => $payload['errorCode'] ?? $payload['ErrorCode'] ?? null,
            'errorDesc' => $payload['errorDesc'] ?? $payload['ErrorDesc'] ?? null,
            'message' => $payload['message'] ?? $payload['Message'] ?? null,
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


    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function sanitizeCardPayload(array $payload): array
    {
        foreach (['MaskedPan', 'SecurePan', 'CardNumber', 'cardNumberMasked'] as $key) {
            if (array_key_exists($key, $payload)) {
                $payload[$key] = $this->maskCardNumber($payload[$key]);
            }
        }

        foreach (['TransactionDetail', 'transactionDetail'] as $detailKey) {
            if (! is_array($payload[$detailKey] ?? null)) {
                continue;
            }

            foreach (['MaskedPan', 'SecurePan', 'CardNumber', 'cardNumber'] as $key) {
                if (array_key_exists($key, $payload[$detailKey])) {
                    $payload[$detailKey][$key] = $this->maskCardNumber($payload[$detailKey][$key]);
                }
            }
        }

        return $payload;
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

    /**
     * @param  array<string, mixed>  $request
     * @return array<string, mixed>
     */
    private function redactVerifyRequest(array $request): array
    {
        if (isset($request['NationalCode'])) {
            $request['NationalCode'] = '***'.substr((string) $request['NationalCode'], -3);
        }

        if (isset($request['CellNumber'])) {
            $request['CellNumber'] = '***'.substr((string) $request['CellNumber'], -4);
        }

        return $request;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<int, string>  $paths
     */
    private function first(array $payload, array $paths): mixed
    {
        foreach ($paths as $path) {
            $value = data_get($payload, $path);

            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        return null;
    }

    private function nationalCode(mixed $value): ?string
    {
        $value = preg_replace('/\D+/', '', (string) $value);

        return is_string($value) && strlen($value) === 10 ? $value : null;
    }

    private function stringOrNull(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function integerOrNull(mixed $value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }

    private function booleanOrNull(mixed $value): ?bool
    {
        return match (true) {
            is_bool($value) => $value,
            $value === 1, $value === '1', $value === 'true', $value === 'True' => true,
            $value === 0, $value === '0', $value === 'false', $value === 'False' => false,
            default => null,
        };
    }
}
