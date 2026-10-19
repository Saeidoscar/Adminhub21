<?php

use App\Http\Controllers\Api\V1\ReviewController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/reviews/{targetId}', [ReviewController::class, 'index'])->whereNumber('targetId');
});

Route::post('/reviews', [ReviewController::class, 'store'])->middleware('auth:sanctum');
Route::put('/reviews/{review}', [ReviewController::class, 'update'])->whereNumber('review')->middleware('auth:sanctum');
Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->whereNumber('review')->middleware('auth:sanctum');
Route::post('/reviews/{user}/recalculate', [ReviewController::class, 'recalculate'])->whereNumber('user')->middleware('auth:sanctum');
