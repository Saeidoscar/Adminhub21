<?php

use App\Http\Controllers\Api\V1\ContractController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/contracts', [ContractController::class, 'index']);
    Route::post('/contracts', [ContractController::class, 'store']);
    Route::get('/contracts/{contract}', [ContractController::class, 'show'])->whereNumber('contract');
    Route::put('/contracts/{contract}', [ContractController::class, 'update'])->whereNumber('contract');
    Route::post('/contracts/{contract}/sign', [ContractController::class, 'sign'])->whereNumber('contract');
    Route::post('/contracts/{contract}/pdf', [ContractController::class, 'generatePdf'])->whereNumber('contract');
    Route::get('/contracts/{contract}/pdf', [ContractController::class, 'downloadPdf'])->whereNumber('contract');

    // Lifecycle transitions. The controller already implemented these; without
    // routes, a contract could never move past "draft".
    Route::post('/contracts/{contract}/activate', [ContractController::class, 'activate'])->whereNumber('contract');
    Route::post('/contracts/{contract}/complete', [ContractController::class, 'complete'])->whereNumber('contract');
    Route::post('/contracts/{contract}/cancel', [ContractController::class, 'cancel'])->whereNumber('contract');

    Route::post('/contracts/{contract}/review', [ContractController::class, 'review'])->whereNumber('contract');
});
