<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ReviewController;

Route::get('/reviews/{targetId}', [ReviewController::class, 'index'])->whereNumber('targetId');
Route::post('/reviews', [ReviewController::class, 'store'])->middleware('auth:sanctum');
Route::put('/reviews/{id}', [ReviewController::class, 'update'])->whereNumber('id')->middleware('auth:sanctum');
Route::delete('/reviews/{id}', [ReviewController::class, 'destroy'])->whereNumber('id')->middleware('auth:sanctum');
