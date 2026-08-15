<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FinancialController;
use App\Http\Controllers\Admin\OperationController;
use App\Http\Controllers\Admin\TicketController;
use App\Http\Controllers\Admin\TicketDepartmentController;
use App\Http\Controllers\Admin\TicketMessageController;
use App\Http\Controllers\Admin\OptionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WalletTransactionController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware('admin.panel')->group(function (): void {
    Route::post('/auth/login', [AdminAuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::middleware([
        'auth:sanctum',
        'admin.panel.token',
        'role:admin',
        'throttle:120,1',
    ])->group(function (): void {
        Route::post('/auth/logout', [AdminAuthController::class, 'logout']);
        Route::get('/dashboard', DashboardController::class);
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/wallet-transactions', [WalletTransactionController::class, 'index']);
        Route::get('/financials', [FinancialController::class, 'index']);
        Route::get('/operations', OperationController::class);
        Route::get('/tickets/meta', [TicketController::class, 'meta']);
        Route::get('/tickets', [TicketController::class, 'index']);
        Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
        Route::patch('/tickets/{ticket}', [TicketController::class, 'update']);
        Route::post('/tickets/{ticket}/messages', [TicketMessageController::class, 'store']);
        Route::get('/ticket-departments', [TicketDepartmentController::class, 'index']);
        Route::patch('/ticket-departments/{department}', [TicketDepartmentController::class, 'update'])
            ->whereNumber('department');
        Route::get('/options', [OptionController::class, 'index']);
        Route::patch('/options/{option}', [OptionController::class, 'update'])
            ->whereNumber('option');
    });
});
