<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\PackageController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/packages', [PackageController::class, 'index']);
    Route::post('/packages', [PackageController::class, 'store']);
    Route::get('/packages/{id}', [PackageController::class, 'show'])->whereNumber('id');
    Route::put('/packages/{id}', [PackageController::class, 'update'])->whereNumber('id');
    Route::delete('/packages/{id}', [PackageController::class, 'destroy'])->whereNumber('id');
    Route::post('/packages/{id}/publish', [PackageController::class, 'publish'])->whereNumber('id');
    Route::post('/packages/{id}/unpublish', [PackageController::class, 'unpublish'])->whereNumber('id');
});
