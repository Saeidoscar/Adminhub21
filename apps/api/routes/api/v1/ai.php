<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AiController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/ai/chat', [AiController::class, 'chat']);
    Route::post('/ai/analyze', [AiController::class, 'analyze']);
    Route::get('/ai/history', [AiController::class, 'history']);
    Route::delete('/ai/history', [AiController::class, 'clearHistory']);
});
