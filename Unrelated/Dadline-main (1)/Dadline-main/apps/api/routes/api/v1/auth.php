<?php

use App\Http\Controllers\Auth\CheckMobileController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth — عملیات احراز هویت (پابلیک تا قبل از لاگین، بعدش نیاز به توکن)
|--------------------------------------------------------------------------
| مسیر نهایی: api.dadline.net/v1/auth/...
|
| FIX: قبلاً هیچ‌کدام از روت‌های پابلیک throttle نداشتند؛ یعنی امکان
| brute-force روی رمز عبور / کد OTP، و اسپم پیامک/تماس روی send-otp
| بدون هیچ محدودیتی وجود داشت. مقادیر throttle زیر پیشنهادی‌اند و باید
| با توجه به رفتار واقعی کاربران تنظیم شوند.
*/

Route::prefix('auth')->group(function () {

    // ── بدون نیاز به احراز هویت ──
    Route::post('/check-mobile', [CheckMobileController::class, 'check'])
        ->middleware('throttle:20,1');

    Route::post('/register', [RegisterController::class, 'register'])
        ->middleware('throttle:10,1');

    Route::post('/login', [LoginController::class, 'login'])
        ->middleware('throttle:10,1');

    Route::prefix('otp')->group(function () {
        Route::post('/send', [OtpController::class, 'send'])
            ->middleware('throttle:5,1');

        Route::post('/verify', [OtpController::class, 'verify'])
            ->middleware('throttle:5,1');

        Route::post('/verify-registration', [OtpController::class, 'verifyForRegistration'])
            ->middleware('throttle:5,1');
    });

    // Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
    // Route::post('/password/reset', [PasswordResetController::class, 'reset']);

    // ── نیاز به توکن معتبر ──
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [LogoutController::class, 'logout']);
        Route::get('/me', [LoginController::class, 'me']);
        Route::post('/me/notifications/dismiss', [LoginController::class, 'dismissNotification']);
    });
});
