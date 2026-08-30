<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AdminContentController;
use App\Http\Controllers\Api\V1\AdminTicketController;

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/dashboard/stats', [AdminController::class, 'dashboardStats']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/users/{id}', [AdminController::class, 'showUser'])->whereNumber('id');
    Route::patch('/users/{id}', [AdminController::class, 'updateUser'])->whereNumber('id');
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser'])->whereNumber('id');
    Route::put('/users/{id}/ban', [AdminController::class, 'banUser'])->whereNumber('id');
    Route::put('/users/{id}/unban', [AdminController::class, 'unbanUser'])->whereNumber('id');
    Route::get('/contracts', [AdminController::class, 'contracts']);
    Route::get('/contracts/{id}', [AdminController::class, 'showContract'])->whereNumber('id');
    Route::patch('/contracts/{id}', [AdminController::class, 'updateContract'])->whereNumber('id');
    Route::get('/reports', [AdminController::class, 'reports']);
    Route::get('/settings', [AdminController::class, 'settings']);
    Route::put('/settings', [AdminController::class, 'updateSettings']);
    Route::get('/wallet/withdrawals/pending', [AdminController::class, 'pendingWithdrawals']);
    Route::put('/wallet/withdrawals/{id}/approve', [AdminController::class, 'approveWithdrawal'])->whereNumber('id');
    Route::put('/wallet/withdrawals/{id}/reject', [AdminController::class, 'rejectWithdrawal'])->whereNumber('id');

    Route::get('/affiliates', [AdminController::class, 'affiliates']);
    Route::get('/affiliates/{id}', [AdminController::class, 'showAffiliate'])->whereNumber('id');
    Route::get('/affiliates/{id}/commissions', [AdminController::class, 'affiliateCommissions'])->whereNumber('id');

    Route::get('/content/stories', [AdminContentController::class, 'stories']);
    Route::patch('/content/stories/{id}', [AdminContentController::class, 'moderateStory'])->whereNumber('id');
    Route::get('/content/blogs', [AdminContentController::class, 'blogs']);
    Route::patch('/content/blogs/{id}', [AdminContentController::class, 'moderateBlog'])->whereNumber('id');
    Route::get('/content/comments', [AdminContentController::class, 'comments']);
    Route::delete('/content/comments/{id}', [AdminContentController::class, 'deleteComment'])->whereNumber('id');

    Route::get('/tickets', [AdminTicketController::class, 'index']);
    Route::get('/tickets/{id}', [AdminTicketController::class, 'show'])->whereNumber('id');
    Route::patch('/tickets/{id}', [AdminTicketController::class, 'update'])->whereNumber('id');
    Route::post('/tickets/{id}/assign', [AdminTicketController::class, 'assign'])->whereNumber('id');
    Route::post('/tickets/{id}/close', [AdminTicketController::class, 'close'])->whereNumber('id');
    Route::post('/tickets/{id}/reply', [AdminTicketController::class, 'reply'])->whereNumber('id');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin-profiles')->group(function () {
    Route::get('/', [AdminController::class, 'profiles']);
    Route::get('/{id}', [AdminController::class, 'showProfile'])->whereNumber('id');
    Route::put('/me', [AdminController::class, 'updateMyProfile']);
});
