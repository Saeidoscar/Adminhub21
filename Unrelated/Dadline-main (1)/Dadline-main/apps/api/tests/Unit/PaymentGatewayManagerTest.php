<?php

namespace Tests\Unit;

use App\Enums\PaymentGateway as PaymentGatewayEnum;
use App\Services\Payments\PaymentGatewayException;
use App\Services\Payments\PaymentGatewayInitiation;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\Payments\SepPaymentGateway;
use App\Services\Payments\SnappPayPaymentGateway;
use App\Services\Payments\ZibalPaymentGateway;
use Mockery;
use Tests\TestCase;

class PaymentGatewayManagerTest extends TestCase
{
    public function test_smart_gateway_falls_back_to_zibal_when_sep_has_retryable_failure(): void
    {
        $sep = Mockery::mock(SepPaymentGateway::class);
        $zibal = Mockery::mock(ZibalPaymentGateway::class);
        $snappPay = Mockery::mock(SnappPayPaymentGateway::class);

        $sep->shouldReceive('initiate')
            ->once()
            ->andThrow(new PaymentGatewayException('SEP gateway options are incomplete.'));

        $zibal->shouldReceive('initiate')
            ->once()
            ->andReturn(new PaymentGatewayInitiation(
                gateway: PaymentGatewayEnum::Zibal->value,
                paymentUrl: 'https://gateway.zibal.ir/start/123',
                token: '123',
                authority: '123',
            ));

        $result = new PaymentGatewayManager($sep, $zibal, $snappPay)
            ->initiateSmart(50_000, 'https://dadline.net/v1/payments/1/callback');

        $this->assertSame(PaymentGatewayEnum::Zibal->value, $result->gateway);
    }

    public function test_explicit_sep_gateway_does_not_fall_back_to_zibal(): void
    {
        $sep = Mockery::mock(SepPaymentGateway::class);
        $zibal = Mockery::mock(ZibalPaymentGateway::class);
        $snappPay = Mockery::mock(SnappPayPaymentGateway::class);

        $sep->shouldReceive('initiate')
            ->once()
            ->andThrow(new PaymentGatewayException('SEP gateway options are incomplete.'));

        $zibal->shouldNotReceive('initiate');

        $this->expectException(PaymentGatewayException::class);
        $this->expectExceptionMessage('SEP gateway options are incomplete.');

        new PaymentGatewayManager($sep, $zibal, $snappPay)
            ->initiateSmart(
                50_000,
                'https://dadline.net/v1/payments/1/callback',
                preferredGateway: PaymentGatewayEnum::Sep
            );
    }
}
