<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 — فهرست دسته‌بندی‌ها
|--------------------------------------------------------------------------
*/

Route::group([], base_path('routes/api/v1/system.php'));
Route::group([], base_path('routes/api/v1/auth.php'));
Route::group([], base_path('routes/api/v1/public.php'));
Route::group([], base_path('routes/api/v1/payments.php'));
Route::group([], base_path('routes/api/v1/webhooks.php'));
Route::group([], base_path('routes/api/v1/content.php'));
Route::group([], base_path('routes/api/v1/cases.php'));
Route::group([], base_path('routes/api/v1/consultations.php'));
Route::group([], base_path('routes/api/v1/contracts.php'));
Route::group([], base_path('routes/api/v1/users.php'));
Route::group([], base_path('routes/api/v1/tickets.php'));
Route::group([], base_path('routes/api/v1/admin.php'));
Route::group([], base_path('routes/api/v1/list.php'));
Route::group([], base_path('routes/api/v1/single.php'));
