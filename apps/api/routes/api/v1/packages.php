<?php

use App\Http\Controllers\Api\V1\PackageController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/packages', [PackageController::class, 'index']);
    Route::post('/packages', [PackageController::class, 'store']);
    Route::get('/packages/{package}', [PackageController::class, 'show'])->whereNumber('package');
    Route::put('/packages/{request}', [PackageController::class, 'update'])->whereNumber('request');
    Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->whereNumber('package');
    Route::post('/packages/{package}/publish', [PackageController::class, 'publish'])->whereNumber('package');
    Route::post('/packages/{package}/unpublish', [PackageController::class, 'unpublish'])->whereNumber('package');
});
