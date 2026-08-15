<?php

namespace Tests\Unit;

use App\Models\Option;
use App\Models\WalletTransactionPayment;
use App\Services\Payments\PaymentGatewayException;
use App\Services\Payments\ZibalPaymentGateway;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ZibalPaymentGatewayTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

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

    public function test_level_three_request_sends_national_code_only_with_explicit_enforcement(): void
    {
        $this->configureZibal();

        Http::fake([
            'gateway.zibal.ir/v1/request' => Http::response([
                'trackId' => 15966442233311,
                'result' => 100,
                'message' => 'success',
            ]),
        ]);

        $result = app(ZibalPaymentGateway::class)->initiate(66_000, 'https://dadline.test/callback', [
            'payment_id' => 123,
            'description' => 'احراز هویت بانکی سطح ۳',
            'mobile' => '09123456789',
            'nationalCode' => '0012345678',
            'enforceCardOwnerNationalCode' => true,
        ]);

        Http::assertSent(function (Request $request): bool {
            $data = $request->data();

            return $request->url() === 'https://gateway.zibal.ir/v1/request'
                && $data['merchant'] === 'merchant-code'
                && $data['amount'] === 660_000
                && $data['orderId'] === '123'
                && $data['mobile'] === '09123456789'
                && $data['nationalCode'] === '0012345678'
                && ! array_key_exists('checkMobileWithCard', $data);
        });

        $this->assertSame('https://gateway.zibal.ir/start/15966442233311', $result->paymentUrl);
        $this->assertSame('15966442233311', $result->token);
        $this->assertTrue($result->cardOwnerVerificationEnforced);
        $this->assertSame('zibal_request_national_code', $result->cardOwnerVerificationMethod);
    }

    public function test_ordinary_zibal_payment_does_not_send_national_code_without_explicit_enforcement(): void
    {
        $this->configureZibal();

        Http::fake([
            'gateway.zibal.ir/v1/request' => Http::response([
                'trackId' => 15966442233311,
                'result' => 100,
                'message' => 'success',
            ]),
        ]);

        app(ZibalPaymentGateway::class)->initiate(66_000, 'https://dadline.test/callback', [
            'payment_id' => 123,
            'mobile' => '09123456789',
            'nationalCode' => '0012345678',
        ]);

        Http::assertSent(function (Request $request): bool {
            $data = $request->data();

            return $request->url() === 'https://gateway.zibal.ir/v1/request'
                && ! array_key_exists('nationalCode', $data)
                && ! array_key_exists('checkMobileWithCard', $data);
        });
    }

    public function test_level_three_verify_requires_exact_amount_and_recorded_ownership_request(): void
    {
        $this->configureZibal();

        Http::fake([
            'gateway.zibal.ir/v1/verify' => Http::response([
                'result' => 100,
                'message' => 'success',
                'amount' => 100_000,
                'refNumber' => '1234567890',
                'cardNumber' => '603799******1234',
            ]),
        ]);

        $payment = new WalletTransactionPayment([
            'gateway' => 'zibal',
            'amount' => 10_000,
            'gateway_token' => '15966442233311',
            'request_payload' => [
                'expected_amount_rial' => 100_000,
                'card_owner_verification_required' => true,
                'gateway_card_owner_verification_enforced' => true,
            ],
        ]);

        $result = app(ZibalPaymentGateway::class)->verify($payment, [
            'trackId' => '15966442233311',
        ]);

        $this->assertTrue($result->successful);
        $this->assertTrue($result->ownershipChecked);
        $this->assertSame('zibal_request_national_code', $result->ownershipMethod);
        $this->assertSame(100_000, $result->verifiedAmountRial);
    }

    public function test_verify_rejects_callback_track_id_that_differs_from_payment_snapshot(): void
    {
        $this->configureZibal();

        Http::fake();

        $payment = new WalletTransactionPayment([
            'gateway' => 'zibal',
            'amount' => 10_000,
            'gateway_token' => 'stored-track-id',
            'request_payload' => [
                'expected_amount_rial' => 100_000,
                'card_owner_verification_required' => true,
                'gateway_card_owner_verification_enforced' => true,
            ],
        ]);

        try {
            app(ZibalPaymentGateway::class)->verify($payment, [
                'trackId' => 'different-track-id',
            ]);
            $this->fail('Expected a mismatched callback track id to be rejected.');
        } catch (PaymentGatewayException $exception) {
            $this->assertFalse($exception->retryable);
            $this->assertSame('track_id_mismatch', $exception->context['failure_reason']);
        }

        Http::assertNothingSent();
    }

    public function test_level_three_verify_rejects_missing_amount_or_missing_ownership_marker(): void
    {
        $this->configureZibal();

        Http::fake([
            'gateway.zibal.ir/v1/verify' => Http::response([
                'result' => 100,
                'message' => 'success',
                'refNumber' => '1234567890',
            ]),
        ]);

        $payment = new WalletTransactionPayment([
            'gateway' => 'zibal',
            'amount' => 10_000,
            'gateway_token' => '15966442233311',
            'request_payload' => [
                'expected_amount_rial' => 100_000,
                'card_owner_verification_required' => true,
                'gateway_card_owner_verification_enforced' => false,
            ],
        ]);

        $result = app(ZibalPaymentGateway::class)->verify($payment);

        $this->assertFalse($result->successful);
        $this->assertFalse($result->ownershipChecked);
        $this->assertSame('ownership_check_not_requested', $result->failureReason);
        $this->assertSame([
            'ownership_check_not_requested',
            'verified_amount_missing',
        ], $result->payload['_dadline_verification']['validation_errors']);
    }

    public function test_failed_token_request_includes_gateway_result_details(): void
    {
        $this->configureZibal();

        Http::fake([
            'gateway.zibal.ir/v1/request' => Http::response([
                'result' => -9,
                'message' => 'invalid callbackUrl',
            ]),
        ]);

        $this->expectException(PaymentGatewayException::class);
        $this->expectExceptionMessage('result=-9 message=invalid callbackUrl');

        app(ZibalPaymentGateway::class)->initiate(50_000, 'https://dadline.net/v1/payments/123/callback');
    }

    private function configureZibal(): void
    {
        Option::set('payment_zibal_enabled', '1', 'payment');
        Option::set('payment_zibal_merchant', 'merchant-code', 'payment');
        Option::set('payment_zibal_request_url', 'https://gateway.zibal.ir/v1/request', 'payment');
        Option::set('payment_zibal_verify_url', 'https://gateway.zibal.ir/v1/verify', 'payment');
        Option::set('payment_zibal_start_url', 'https://gateway.zibal.ir/start', 'payment');
    }
}
