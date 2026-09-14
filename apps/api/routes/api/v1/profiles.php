<?php

use App\Http\Controllers\Api\V1\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/profiles/{id}', [ProfileController::class, 'show'])->whereNumber('id');
Route::get('/profiles', [ProfileController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
});
