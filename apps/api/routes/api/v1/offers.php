<?php

use App\Http\Controllers\Api\V1\OfferController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/offers', [OfferController::class, 'index']);
    Route::post('/offers', [OfferController::class, 'store']);
    Route::get('/offers/{offer}', [OfferController::class, 'show'])->whereNumber('offer');
    Route::put('/offers/{offer}', [OfferController::class, 'update'])->whereNumber('offer');
    Route::delete('/offers/{offer}', [OfferController::class, 'destroy'])->whereNumber('offer');
    Route::post('/offers/{offer}/accept', [OfferController::class, 'accept'])->whereNumber('offer');
    Route::post('/offers/{offer}/reject', [OfferController::class, 'reject'])->whereNumber('offer');
});
