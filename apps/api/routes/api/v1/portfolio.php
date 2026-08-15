<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\PortfolioController;

Route::get('/portfolio/{userId}', [PortfolioController::class, 'index'])->whereNumber('userId');
Route::get('/portfolio/item/{id}', [PortfolioController::class, 'show'])->whereNumber('id');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/portfolio', [PortfolioController::class, 'store']);
    Route::put('/portfolio/{id}', [PortfolioController::class, 'update'])->whereNumber('id');
    Route::delete('/portfolio/{id}', [PortfolioController::class, 'destroy'])->whereNumber('id');
    Route::post('/portfolio/{id}/media', [PortfolioController::class, 'uploadMedia'])->whereNumber('id');
});
