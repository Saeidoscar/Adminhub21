<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json(['status' => 'ok', 'version' => 'v1']);
    });
});

require base_path('routes/api/v1/auth.php');
require base_path('routes/api/v1/profiles.php');
require base_path('routes/api/v1/packages.php');
require base_path('routes/api/v1/contracts.php');
require base_path('routes/api/v1/offers.php');
require base_path('routes/api/v1/reviews.php');
require base_path('routes/api/v1/payments.php');
require base_path('routes/api/v1/wallets.php');
require base_path('routes/api/v1/cases.php');
require base_path('routes/api/v1/schedule.php');
require base_path('routes/api/v1/portfolio.php');
require base_path('routes/api/v1/tickets.php');
require base_path('routes/api/v1/content.php');
require base_path('routes/api/v1/ai.php');
require base_path('routes/api/v1/affiliate.php');
require base_path('routes/api/v1/public.php');
require base_path('routes/api/v1/admin.php');
