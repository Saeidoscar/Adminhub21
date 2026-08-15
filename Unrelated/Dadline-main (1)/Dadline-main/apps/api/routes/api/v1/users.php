<?php

use App\Http\Controllers\Api\Users\UserNotificationController;
use App\Http\Controllers\Api\Users\UserNotificationSettingsController;
use App\Http\Controllers\Api\Users\UserProfileController;
use App\Http\Controllers\Api\Users\UserSignatureController;
use App\Http\Controllers\Api\Users\UserVerificationController;
use App\Http\Controllers\Api\Users\UserWalletController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Users — پروفایل و تنظیمات کاربر جاری (نه مدیریت کاربران دیگر)
|--------------------------------------------------------------------------
| مدیریت کاربران دیگر (لیست/تعلیق/تغییر نقش و غیره) در admin.php است.
|
| مسیر نهایی: api.dadline.net/v1/users/me
*/

Route::prefix('users')->middleware('auth:sanctum')->group(function () {
    Route::get('/me', [UserProfileController::class, 'show'])->name('users.me.show');
    Route::patch('/me', [UserProfileController::class, 'update'])->name('users.me.update');
    Route::patch('/me/bank-account', [UserProfileController::class, 'bankAccount'])->name('users.me.bank-account.update');
    Route::post('/me/avatar', [UserProfileController::class, 'avatar'])->name('users.me.avatar.store');
    Route::post('/me/signature', [UserSignatureController::class, 'store'])->name('users.me.signature.store');
    Route::get('/me/verification', [UserVerificationController::class, 'show'])->name('users.me.verification.show');
    Route::post('/me/verification/level-one', [UserVerificationController::class, 'levelOne'])->name('users.me.verification.level-one');
    Route::post('/me/verification/level-two', [UserVerificationController::class, 'levelTwo'])->name('users.me.verification.level-two');
    Route::post('/me/verification/level-three', [UserVerificationController::class, 'levelThree'])->name('users.me.verification.level-three');
    Route::post('/me/api-token', [UserVerificationController::class, 'apiToken'])->name('users.me.api-token.store');
    Route::get('/me/wallet', [UserWalletController::class, 'show'])->name('users.me.wallet.show');
    Route::post('/me/wallet/charges', [UserWalletController::class, 'charge'])->name('users.me.wallet.charges.store');
    Route::post('/me/wallet/withdrawals', [UserWalletController::class, 'withdraw'])->name('users.me.wallet.withdrawals.store');
    Route::post('/me/wallet/gift-cards/redeem', [UserWalletController::class, 'redeemGiftCard'])->name('users.me.wallet.gift-cards.redeem');
    Route::post('/me/wallet/gift-cards', [UserWalletController::class, 'createGiftCard'])->name('users.me.wallet.gift-cards.store');
    Route::get('/me/notifications', [UserNotificationController::class, 'index'])->name('users.me.notifications.index');
    Route::get('/me/notification-settings', [UserNotificationSettingsController::class, 'show'])->name('users.me.notification-settings.show');
    Route::patch('/me/notification-settings', [UserNotificationSettingsController::class, 'update'])->name('users.me.notification-settings.update');
    Route::post('/me/notification-settings/sms-packages', [UserNotificationSettingsController::class, 'buySmsPackage'])->name('users.me.notification-settings.sms-packages.store');
    // Route::delete('/me', [UserProfileController::class, 'destroy']); // حذف حساب کاربری
});
