<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ContractController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/contracts', [ContractController::class, 'index']);
    Route::post('/contracts', [ContractController::class, 'store']);
    Route::get('/contracts/{id}', [ContractController::class, 'show'])->whereNumber('id');
    Route::put('/contracts/{id}', [ContractController::class, 'update'])->whereNumber('id');
    Route::post('/contracts/{id}/sign', [ContractController::class, 'sign'])->whereNumber('id');
    Route::post('/contracts/{id}/pdf', [ContractController::class, 'generatePdf'])->whereNumber('id');
    Route::get('/contracts/{id}/pdf', [ContractController::class, 'downloadPdf'])->whereNumber('id');
});
