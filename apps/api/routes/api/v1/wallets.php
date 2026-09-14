<?php

use App\Http\Controllers\Api\V1\WalletController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/wallet/balance', [WalletController::class, 'balance']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    Route::post('/wallet/deposit', [WalletController::class, 'deposit']);
    Route::post('/wallet/withdraw', [WalletController::class, 'withdraw']);
    Route::post('/wallet/transfer', [WalletController::class, 'transfer']);
});
