<?php

namespace App\Services\Payments;

use App\Enums\PaymentGateway as PaymentGatewayEnum;
use App\Models\WalletTransactionPayment;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SnappPayPaymentGateway implements PaymentGateway
{
    public function __construct(private OptionPaymentSettings $settings) {}

    public function name(): string
    {
        return PaymentGatewayEnum::SnappPay->value;
    }

    public function initiate(int $amount, string $callbackUrl, array $metadata = []): PaymentGatewayInitiation
    {
        if (! $this->settings->enabled('payment_snapp_pay_enabled')) {
            throw new PaymentGatewayException('SnappPay gateway is disabled.', false);
        }

        $requestUrl = $this->settings->string('payment_snapp_pay_request_url');

        if ($requestUrl === null) {
            throw new PaymentGatewayException('SnappPay gateway options are incomplete.', false);
        }

        $rialAmount = $this->tomanToRial($amount);
        $paymentId = (string) ($metadata['payment_id'] ?? random_int(10000, 99999));
        $request = [
            'amount' => $rialAmount,
            'cartList' => [
                [
                    'cartId' => (int) preg_replace('/\D+/', '', $paymentId),
                    'cartItems' => [
                        [
                            'amount' => $rialAmount,
                            'category' => (string) ($metadata['category'] ?? $this->settings->string('payment_snapp_pay_default_category', 'legal-services')),
                            'count' => 1,
                            'id' => (int) ($metadata['purchasable_id'] ?? $metadata['payment_id'] ?? 1),
                            'name' => (string) ($metadata['description'] ?? 'Dadline wallet charge'),
                            'commissionType' => (int) $this->settings->string('payment_snapp_pay_commission_type', '100'),
                        ],
                    ],
                    'isShipmentIncluded' => true,
                    'isTaxIncluded' => true,
                    'shippingAmount' => 0,
                    'taxAmount' => 0,
                    'totalAmount' => $rialAmount,
                ],
            ],
            'discountAmount' => 0,
            'externalSourceAmount' => 0,
            'mobile' => (string) ($metadata['mobile'] ?? ''),
            'returnURL' => $callbackUrl,
            'transactionId' => $this->transactionId($paymentId),
        ];

        $forcedPaymentMethods = $metadata['forcedPaymentMethodTypes']
            ?? $this->settings->string('payment_snapp_pay_forced_payment_method_types');

        if (is_array($forcedPaymentMethods) && $forcedPaymentMethods !== []) {
            $request['forcedPaymentMethodTypes'] = $forcedPaymentMethods;
        }

        $response = Http::timeout(12)
            ->withToken($this->accessToken())
            ->post($requestUrl, $request);

        if (! $response->ok()) {
            throw new PaymentGatewayException('SnappPay request failed.', false);
        }

        $payload = $response->json() ?? [];
        $token = $payload['response']['paymentToken'] ?? $payload['paymentToken'] ?? null;
        $paymentUrl = $payload['response']['paymentPageUrl'] ?? $payload['paymentPageUrl'] ?? null;

        if (($payload['successful'] ?? false) !== true || $token === null || $paymentUrl === null) {
            throw new PaymentGatewayException('SnappPay did not create a payment token.', false);
        }

        return new PaymentGatewayInitiation(
            gateway: $this->name(),
            paymentUrl: (string) $paymentUrl,
            token: (string) $token,
            authority: (string) $token,
            payload: $payload
        );
    }

    public function verify(WalletTransactionPayment $payment, array $payload = []): PaymentVerificationResult
    {
        $verifyUrl = $this->settings->string('payment_snapp_pay_verify_url');
        $settleUrl = $this->settings->string('payment_snapp_pay_settle_url');
        $paymentToken = $payment->gateway_token ?? $payment->authority;

        if ($verifyUrl === null || $settleUrl === null || $paymentToken === null) {
            throw new PaymentGatewayException('SnappPay verify options are incomplete.', false);
        }

        if (isset($payload['state']) && $payload['state'] !== 'OK') {
            return new PaymentVerificationResult(false, payload: $payload);
        }

        $response = Http::timeout(12)
            ->withToken($this->accessToken())
            ->post($verifyUrl, [
                'paymentToken' => $paymentToken,
            ]);

        if (! $response->ok()) {
            throw new PaymentGatewayException('SnappPay verify failed.', false);
        }

        $data = $response->json() ?? [];
        $successful = ($data['successful'] ?? false) === true;

        if ($successful) {
            $settleResponse = Http::timeout(12)
                ->withToken($this->accessToken())
                ->post($settleUrl, [
                    'paymentToken' => $paymentToken,
                ]);

            $settleData = $settleResponse->json() ?? [];
            $successful = $settleResponse->ok() && ($settleData['successful'] ?? false) === true;
            $data['settle'] = $settleData;
        }

        return new PaymentVerificationResult(
            successful: $successful,
            refNum: $data['response']['transactionId'] ?? $payload['transactionId'] ?? null,
            rrn: $data['rrn'] ?? null,
            cardNumberMasked: $data['cardNumberMasked'] ?? null,
            gatewayFee: (int) ($data['gatewayFee'] ?? 0),
            payload: $data
        );
    }

    private function tomanToRial(int $amount): int
    {
        return $amount * 10;
    }

    private function accessToken(): string
    {
        return Cache::remember('payment:snapp_pay:access_token', now()->addMinutes(50), function (): string {
            $oauthUrl = $this->settings->string('payment_snapp_pay_oauth_url');
            $clientId = $this->settings->string('payment_snapp_pay_client_id');
            $clientSecret = $this->settings->string('payment_snapp_pay_client_secret');
            $username = $this->settings->string('payment_snapp_pay_user_name')
                ?? $this->settings->string('payment_snapp_pay_username');
            $password = $this->settings->string('payment_snapp_pay_password');

            if ($oauthUrl === null || $clientId === null || $clientSecret === null || $username === null || $password === null) {
                throw new PaymentGatewayException('SnappPay OAuth options are incomplete.', false);
            }

            $response = Http::timeout(12)
                ->withBasicAuth($clientId, $clientSecret)
                ->asForm()
                ->post($oauthUrl, [
                    'grant_type' => 'password',
                    'scope' => 'online-merchant',
                    'username' => $username,
                    'password' => $password,
            ]);

            if (! $response->ok()) {
                Log::warning('SnappPay OAuth failed.', [
                    'status' => $response->status(),
                    'oauth_url' => $oauthUrl,
                    'client_id' => $clientId,
                    'username' => $username,
                    'response' => $response->json() ?? $response->body(),
                ]);

                throw new PaymentGatewayException('SnappPay OAuth failed.', false);
            }

            $token = $response->json('access_token');

            if (! is_string($token) || $token === '') {
                throw new PaymentGatewayException('SnappPay OAuth did not return an access token.', false);
            }

            return $token;
        });
    }

    private function transactionId(string $paymentId): string
    {
        return 'DAD'.str_pad(preg_replace('/\D+/', '', $paymentId) ?: '0', 5, '0', STR_PAD_LEFT);
    }
}
