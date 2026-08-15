<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AdminController;

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{id}/ban', [AdminController::class, 'banUser'])->whereNumber('id');
    Route::put('/users/{id}/unban', [AdminController::class, 'unbanUser'])->whereNumber('id');
    Route::get('/reports', [AdminController::class, 'reports']);
    Route::get('/settings', [AdminController::class, 'settings']);
    Route::put('/settings', [AdminController::class, 'updateSettings']);
});
