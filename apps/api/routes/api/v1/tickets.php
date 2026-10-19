<?php

use App\Http\Controllers\Api\V1\TicketController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show'])->whereNumber('ticket');
    Route::put('/tickets/{ticket}', [TicketController::class, 'update'])->whereNumber('ticket');
    Route::post('/tickets/{ticket}/reply', [TicketController::class, 'reply'])->whereNumber('ticket');
    Route::post('/tickets/{ticket}/close', [TicketController::class, 'close'])->whereNumber('ticket');
});
