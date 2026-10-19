<?php

use App\Http\Controllers\Api\V1\UserLookupController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/users/lookup', [UserLookupController::class, 'show']);
});
