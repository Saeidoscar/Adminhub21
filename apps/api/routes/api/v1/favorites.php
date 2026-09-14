<?php

use App\Http\Controllers\Api\V1\FavoriteController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{adminId}', [FavoriteController::class, 'store'])->whereNumber('adminId');
    Route::delete('/favorites/{adminId}', [FavoriteController::class, 'destroy'])->whereNumber('adminId');
});
