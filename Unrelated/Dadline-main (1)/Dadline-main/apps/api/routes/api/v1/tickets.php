<?php

use App\Http\Controllers\Api\Tickets\TicketController;
use App\Http\Controllers\Api\Tickets\TicketMessageController;
use Illuminate\Support\Facades\Route;

Route::prefix('tickets')->middleware(['auth:sanctum', 'throttle:120,1'])->group(function (): void {
    Route::get('/meta', [TicketController::class, 'meta']);
    Route::get('/', [TicketController::class, 'index']);
    Route::post('/', [TicketController::class, 'store'])->middleware('throttle:20,1');
    Route::get('/{ticket}', [TicketController::class, 'show']);
    Route::patch('/{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::post('/{ticket}/messages', [TicketMessageController::class, 'store'])->middleware('throttle:60,1');
});
