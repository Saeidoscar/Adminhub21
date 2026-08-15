<?php

namespace Tests\Unit;

use App\Models\Option;
use App\Services\Payments\SnappPayPaymentGateway;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SnappPayPaymentGatewayTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();

        Schema::create('options', function (Blueprint $table): void {
            $table->id();
            $table->string('group')->default('general');
            $table->string('key')->unique();
            $table->json('value');
            $table->boolean('autoload')->default(false);
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('options');

        parent::tearDown();
    }

    public function test_payment_token_request_matches_snapp_pay_contract_and_uses_rial_amount(): void
    {
        Option::set('payment_snapp_pay_enabled', '1', 'payment');
        Option::set('payment_snapp_pay_oauth_url', 'https://snapp.test/api/online/v1/oauth/token', 'payment');
        Option::set('payment_snapp_pay_request_url', 'https://snapp.test/api/online/payment/v1/token', 'payment');
        Option::set('payment_snapp_pay_client_id', 'dad-line', 'payment');
        Option::set('payment_snapp_pay_client_secret', 'secret', 'payment');
        Option::set('payment_snapp_pay_username', 'dad-line-purchase', 'payment');
        Option::set('payment_snapp_pay_password', 'password', 'payment');
        Option::set('payment_snapp_pay_commission_type', '100', 'payment');
        Option::set('payment_snapp_pay_default_category', 'legal-services', 'payment');

        Http::fake([
            'snapp.test/api/online/v1/oauth/token' => Http::response([
                'access_token' => 'jwt-token',
                'expires_in' => 3600,
            ]),
            'snapp.test/api/online/payment/v1/token' => Http::response([
                'successful' => true,
                'response' => [
                    'paymentToken' => 'payment-token',
                    'paymentPageUrl' => 'https://snapp.test/pay/payment-token',
                ],
            ]),
        ]);

        $result = app(SnappPayPaymentGateway::class)->initiate(66_000, 'https://dadline.test/payments/1/callback', [
            'payment_id' => 123,
            'purchasable_id' => 456,
            'description' => 'هزینه ثبت قرارداد',
            'mobile' => '09123456789',
        ]);

        Http::assertSent(function ($request): bool {
            return $request->url() === 'https://snapp.test/api/online/v1/oauth/token'
                && str_starts_with($request->header('Authorization')[0] ?? '', 'Basic ')
                && $request->data()['grant_type'] === 'password'
                && $request->data()['scope'] === 'online-merchant'
                && $request->data()['username'] === 'dad-line-purchase'
                && $request->data()['password'] === 'password';
        });

        Http::assertSent(function ($request): bool {
            if ($request->url() !== 'https://snapp.test/api/online/payment/v1/token') {
                return false;
            }

            $data = $request->data();

            return ($request->header('Authorization')[0] ?? '') === 'Bearer jwt-token'
                && $data['amount'] === 660_000
                && $data['mobile'] === '09123456789'
                && $data['returnURL'] === 'https://dadline.test/payments/1/callback'
                && $data['transactionId'] === 'DAD00123'
                && $data['cartList'][0]['cartId'] === 123
                && $data['cartList'][0]['totalAmount'] === 660_000
                && $data['cartList'][0]['cartItems'][0]['amount'] === 660_000
                && $data['cartList'][0]['cartItems'][0]['id'] === 456
                && $data['cartList'][0]['cartItems'][0]['commissionType'] === 100;
        });

        $this->assertSame('payment-token', $result->token);
        $this->assertSame('https://snapp.test/pay/payment-token', $result->paymentUrl);
    }
}
