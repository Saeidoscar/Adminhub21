<?php

namespace App\Services\Payments;

use App\Enums\PaymentGateway;

class PaymentCallbackUrl
{
    public function forPayment(int|string $paymentId, ?PaymentGateway $gateway = null): string
    {
        $baseUrl = $this->baseUrl();
        $path = match ($gateway) {
            PaymentGateway::Sep => route('payments.sep.callback', absolute: false),
            PaymentGateway::Zibal => route('payments.zibal.callback', absolute: false),
            default => route('payments.gateway.callback', absolute: false),
        };

        return $baseUrl.$path;
    }

    private function baseUrl(): string
    {
        $configuredUrl = (string) (config('services.payment.callback_base_url') ?: config('app.url'));
        $host = parse_url($configuredUrl, PHP_URL_HOST);

        if ($host === null || in_array($host, ['localhost', '127.0.0.1', '::1', 'api'], true)) {
            return 'https://api.dadline.net';
        }

        return rtrim($configuredUrl, '/');
    }
}
