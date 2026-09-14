<?php

use App\Http\Controllers\Api\V1\OfferController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/offers', [OfferController::class, 'index']);
    Route::post('/offers', [OfferController::class, 'store']);
    Route::get('/offers/{id}', [OfferController::class, 'show'])->whereNumber('id');
    Route::put('/offers/{id}', [OfferController::class, 'update'])->whereNumber('id');
    Route::delete('/offers/{id}', [OfferController::class, 'destroy'])->whereNumber('id');
    Route::post('/offers/{id}/accept', [OfferController::class, 'accept'])->whereNumber('id');
    Route::post('/offers/{id}/reject', [OfferController::class, 'reject'])->whereNumber('id');
});
