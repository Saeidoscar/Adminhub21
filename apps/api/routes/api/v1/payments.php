<?php

use App\Http\Controllers\Api\V1\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware('payment.callback:zibal')->post('/payments/zibal/callback', [PaymentController::class, 'zibalCallback']);
Route::middleware('payment.callback:sep')->post('/payments/sep/callback', [PaymentController::class, 'sepCallback']);
Route::middleware('payment.callback:crypto')->post('/payments/crypto/callback', [PaymentController::class, 'cryptoCallback']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments/request', [PaymentController::class, 'requestPayment']);
    Route::get('/payments/{id}', [PaymentController::class, 'show'])->whereNumber('id');
});
