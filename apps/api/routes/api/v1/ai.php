<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AiController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/ai/models', [AiController::class, 'models']);
    Route::get('/ai/conversations', [AiController::class, 'conversations']);
    Route::post('/ai/conversations', [AiController::class, 'storeConversation']);
    Route::get('/ai/conversations/{conversation}', [AiController::class, 'showConversation']);
    Route::patch('/ai/conversations/{conversation}', [AiController::class, 'updateConversation']);
    Route::delete('/ai/conversations/{conversation}', [AiController::class, 'destroyConversation']);
    Route::post('/ai/conversations/{conversation}/messages', [AiController::class, 'sendMessage']);
    Route::patch('/ai/conversations/{conversation}/model', [AiController::class, 'switchModel']);
    Route::get('/ai/conversations/{conversation}/messages', [AiController::class, 'history']);
    Route::post('/ai/messages/{message}/track', [AiController::class, 'trackTokens']);

    Route::post('/ai/chat', [AiController::class, 'chat']);
    Route::post('/ai/analyze', [AiController::class, 'analyze']);
    Route::get('/ai/history', [AiController::class, 'history']);
    Route::delete('/ai/history', [AiController::class, 'clearHistory']);
});
