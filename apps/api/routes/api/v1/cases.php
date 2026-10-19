<?php

use App\Http\Controllers\Api\V1\CaseController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/cases', [CaseController::class, 'index']);
    Route::post('/cases', [CaseController::class, 'store']);
    Route::get('/cases/{case}', [CaseController::class, 'show'])->whereNumber('case');
    Route::put('/cases/{case}', [CaseController::class, 'update'])->whereNumber('case');
    Route::delete('/cases/{case}', [CaseController::class, 'destroy'])->whereNumber('case');
    Route::post('/cases/{case}/tasks', [CaseController::class, 'addTask'])->whereNumber('case');
    Route::put('/cases/{case}/tasks/{taskId}', [CaseController::class, 'updateTask'])->whereNumber('case')->whereNumber('taskId');
    Route::post('/cases/{case}/events', [CaseController::class, 'addEvent'])->whereNumber('case');
    Route::put('/cases/{case}/events/{eventId}', [CaseController::class, 'updateEvent'])->whereNumber('case')->whereNumber('eventId');
    Route::delete('/cases/{case}/events/{eventId}', [CaseController::class, 'destroyEvent'])->whereNumber('case')->whereNumber('eventId');
    Route::post('/cases/{case}/time-logs', [CaseController::class, 'addTimeLog'])->whereNumber('case');
    Route::put('/cases/{case}/time-logs/{logId}', [CaseController::class, 'updateTimeLog'])->whereNumber('case')->whereNumber('logId');
    Route::delete('/cases/{case}/time-logs/{logId}', [CaseController::class, 'destroyTimeLog'])->whereNumber('case')->whereNumber('logId');
});
