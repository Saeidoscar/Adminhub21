<?php

namespace Tests\Unit;

use App\Http\Controllers\Api\Payments\GatewayPaymentCallbackController;
use ReflectionMethod;
use Tests\TestCase;

class GatewayPaymentCallbackControllerTest extends TestCase
{
    public function test_return_url_normalizes_zero_host_without_changing_wallet_path(): void
    {
        $method = new ReflectionMethod(GatewayPaymentCallbackController::class, 'normalizeReturnUrl');
        $method->setAccessible(true);

        $url = $method->invoke(
            app(GatewayPaymentCallbackController::class),
            'http://0.0.0.0:3000/pishkhan/wallet?payment=success&paymentId=3049'
        );

        $this->assertSame(
            'http://localhost:3000/pishkhan/wallet?payment=success&paymentId=3049',
            $url
        );
    }
}
