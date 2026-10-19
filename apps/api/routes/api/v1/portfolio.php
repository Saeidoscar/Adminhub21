<?php

use App\Http\Controllers\Api\V1\PortfolioController;
use Illuminate\Support\Facades\Route;

Route::get('/portfolio/{userId}', [PortfolioController::class, 'index'])->whereNumber('userId');
Route::get('/portfolio/item/{id}', [PortfolioController::class, 'show'])->whereNumber('id');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/portfolio', [PortfolioController::class, 'store']);
    Route::put('/portfolio/{portfolio}', [PortfolioController::class, 'update'])->whereNumber('portfolio');
    Route::delete('/portfolio/{portfolio}', [PortfolioController::class, 'destroy'])->whereNumber('portfolio');
    Route::post('/portfolio/{portfolio}/media', [PortfolioController::class, 'uploadMedia'])->whereNumber('portfolio');
});
