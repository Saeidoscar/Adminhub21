<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ScheduleController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/schedule/events', [ScheduleController::class, 'events']);
    Route::post('/schedule/events', [ScheduleController::class, 'storeEvent']);
    Route::put('/schedule/events/{id}', [ScheduleController::class, 'updateEvent'])->whereNumber('id');
    Route::delete('/schedule/events/{id}', [ScheduleController::class, 'deleteEvent'])->whereNumber('id');

    Route::get('/schedule/tasks', [ScheduleController::class, 'tasks']);
    Route::post('/schedule/tasks', [ScheduleController::class, 'storeTask']);
    Route::put('/schedule/tasks/{id}', [ScheduleController::class, 'updateTask'])->whereNumber('id');
    Route::post('/schedule/tasks/{id}/complete', [ScheduleController::class, 'completeTask'])->whereNumber('id');

    Route::post('/schedule/timelogs', [ScheduleController::class, 'logTime']);
    Route::get('/schedule/timelogs', [ScheduleController::class, 'timeLogs']);
});
