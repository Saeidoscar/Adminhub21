<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\TicketController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show'])->whereNumber('id');
    Route::put('/tickets/{id}', [TicketController::class, 'update'])->whereNumber('id');
    Route::post('/tickets/{id}/reply', [TicketController::class, 'reply'])->whereNumber('id');
    Route::post('/tickets/{id}/close', [TicketController::class, 'close'])->whereNumber('id');
});
