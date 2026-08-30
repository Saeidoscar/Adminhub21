<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AffiliateController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/affiliate/stats', [AffiliateController::class, 'stats']);
    Route::get('/affiliate/codes', [AffiliateController::class, 'codes']);
    Route::get('/affiliate/referrals', [AffiliateController::class, 'referrals']);
    Route::get('/affiliate/commissions', [AffiliateController::class, 'commissions']);
    Route::post('/affiliate/withdraw', [AffiliateController::class, 'withdraw']);
    Route::post('/affiliate/generate-code', [AffiliateController::class, 'generateCode']);
});
