<?php

use App\Http\Controllers\Api\Payments\GatewayPaymentCallbackController;
use App\Http\Controllers\Api\Payments\PaymentCallbackController;
use Illuminate\Support\Facades\Route;

Route::prefix('payments')->group(function (): void {
    Route::match(['get', 'post'], '/gateway/callback', GatewayPaymentCallbackController::class)
        ->name('payments.gateway.callback');

    Route::match(['get', 'post'], '/sep/callback', GatewayPaymentCallbackController::class)
        ->name('payments.sep.callback');

    Route::match(['get', 'post'], '/zibal/callback', GatewayPaymentCallbackController::class)
        ->name('payments.zibal.callback');

    Route::match(['get', 'post'], '/{payment}/callback', PaymentCallbackController::class)
        ->name('payments.callback');
});
