<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\FavoriteController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{adminId}', [FavoriteController::class, 'store'])->whereNumber('adminId');
    Route::delete('/favorites/{adminId}', [FavoriteController::class, 'destroy'])->whereNumber('adminId');
});
