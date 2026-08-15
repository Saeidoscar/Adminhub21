<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProfileController;

Route::get('/profiles/{id}', [ProfileController::class, 'show'])->whereNumber('id');
Route::get('/profiles', [ProfileController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
});
