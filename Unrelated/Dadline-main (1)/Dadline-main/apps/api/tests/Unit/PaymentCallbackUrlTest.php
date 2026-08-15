<?php

namespace Tests\Unit;

use App\Enums\PaymentGateway;
use App\Services\Payments\PaymentCallbackUrl;
use Tests\TestCase;

class PaymentCallbackUrlTest extends TestCase
{
    public function test_payment_callback_url_uses_default_api_callback_domain(): void
    {
        config([
            'app.url' => 'https://dadline.net',
            'services.payment.callback_base_url' => 'https://api.dadline.net',
        ]);

        $this->get('http://api/v1/system/health');

        $url = app(PaymentCallbackUrl::class)->forPayment(123);

        $this->assertSame('https://api.dadline.net/v1/payments/gateway/callback', $url);
    }

    public function test_payment_callback_url_replaces_localhost_with_api_domain(): void
    {
        config([
            'app.url' => 'http://localhost',
            'services.payment.callback_base_url' => null,
        ]);

        $url = app(PaymentCallbackUrl::class)->forPayment(123);

        $this->assertSame('https://api.dadline.net/v1/payments/gateway/callback', $url);
    }

    public function test_payment_callback_url_can_use_payment_specific_base_url(): void
    {
        config([
            'app.url' => 'http://localhost',
            'services.payment.callback_base_url' => 'https://pay.dadline.test',
        ]);

        $url = app(PaymentCallbackUrl::class)->forPayment(123);

        $this->assertSame('https://pay.dadline.test/v1/payments/gateway/callback', $url);
    }

    public function test_sep_callback_url_uses_sep_callback_without_payment_id_in_path(): void
    {
        config(['services.payment.callback_base_url' => 'https://api.dadline.net']);

        $url = app(PaymentCallbackUrl::class)->forPayment(123, PaymentGateway::Sep);

        $this->assertSame('https://api.dadline.net/v1/payments/sep/callback', $url);
    }

    public function test_zibal_callback_url_uses_gateway_callback_without_payment_id_in_path(): void
    {
        config(['services.payment.callback_base_url' => 'https://api.dadline.net']);

        $url = app(PaymentCallbackUrl::class)->forPayment(123, PaymentGateway::Zibal);

        $this->assertSame('https://api.dadline.net/v1/payments/zibal/callback', $url);
    }
}
