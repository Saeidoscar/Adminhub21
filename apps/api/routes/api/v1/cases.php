<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\CaseController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cases', [CaseController::class, 'index']);
    Route::post('/cases', [CaseController::class, 'store']);
    Route::get('/cases/{id}', [CaseController::class, 'show'])->whereNumber('id');
    Route::put('/cases/{id}', [CaseController::class, 'update'])->whereNumber('id');
    Route::delete('/cases/{id}', [CaseController::class, 'destroy'])->whereNumber('id');
    Route::post('/cases/{id}/tasks', [CaseController::class, 'addTask'])->whereNumber('id');
    Route::put('/cases/{id}/tasks/{taskId}', [CaseController::class, 'updateTask'])->whereNumber('id')->whereNumber('taskId');
    Route::post('/cases/{id}/events', [CaseController::class, 'addEvent'])->whereNumber('id');
    Route::put('/cases/{id}/events/{eventId}', [CaseController::class, 'updateEvent'])->whereNumber('id')->whereNumber('eventId');
    Route::delete('/cases/{id}/events/{eventId}', [CaseController::class, 'destroyEvent'])->whereNumber('id')->whereNumber('eventId');
    Route::post('/cases/{id}/time-logs', [CaseController::class, 'addTimeLog'])->whereNumber('id');
    Route::put('/cases/{id}/time-logs/{logId}', [CaseController::class, 'updateTimeLog'])->whereNumber('id')->whereNumber('logId');
    Route::delete('/cases/{id}/time-logs/{logId}', [CaseController::class, 'destroyTimeLog'])->whereNumber('id')->whereNumber('logId');
});
