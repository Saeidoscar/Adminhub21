<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| System — بدون نیاز به auth، برای مانیتورینگ و health-check
|--------------------------------------------------------------------------
| مسیر نهایی: api.dadline.net/v1/system/health
*/

Route::prefix('system')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'status'    => 'ok',
            'database'  => DB::connection()->getPdo() ? 'connected' : 'disconnected',
            'redis'     => Redis::connection()->ping() ? 'connected' : 'disconnected',
            'timestamp' => now(),
        ]);
    });
});
