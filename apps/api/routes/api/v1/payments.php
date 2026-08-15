<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\PaymentController;

Route::post('/payments/zibal/callback', [PaymentController::class, 'zibalCallback']);
Route::post('/payments/sep/callback', [PaymentController::class, 'sepCallback']);
Route::post('/payments/crypto/callback', [PaymentController::class, 'cryptoCallback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments/request', [PaymentController::class, 'requestPayment']);
    Route::get('/payments/{id}', [PaymentController::class, 'show'])->whereNumber('id');
});
