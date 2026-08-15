<?php

use App\Http\Controllers\CaseController;
use App\Http\Controllers\CaseMessageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Cases (پرونده‌ها) — اندپوینت مشترک برای همه نقش‌ها
|--------------------------------------------------------------------------
| کاربر عادی: فقط پرونده‌های خودش را می‌بیند/می‌سازد (اعمال در Policy/Query).
| کارشناس/وکیل: پرونده‌های محول‌شده به او را می‌بیند و مدیریت می‌کند.
| ادمین: از طریق routes/api/v1/admin.php به همه پرونده‌ها دسترسی دارد.
|
| تفکیک دسترسی در همین‌جا با CasePolicy انجام می‌شود، نه با prefix جدا؛
| یعنی مثلاً show() در Controller بررسی می‌کند که کاربر مالک، کارشناسِ
| محول‌شده، یا ادمین است، وگرنه 403 برمی‌گرداند.
|
| مسیر نهایی: api.dadline.net/v1/cases/...
*/

Route::prefix('cases')->middleware('auth:sanctum')->group(function () {

    // Route::get('/', [CaseController::class, 'index']);          // لیست پرونده‌های مرتبط با کاربر جاری
    // Route::post('/', [CaseController::class, 'store']);         // ثبت پرونده جدید (کاربر عادی)
    // Route::get('/{case}', [CaseController::class, 'show']);      // مشاهده یک پرونده
    // Route::patch('/{case}', [CaseController::class, 'update']);  // ویرایش (بسته به Policy)
    // Route::delete('/{case}', [CaseController::class, 'destroy']);

    // // ── پیام‌ها / پرسش‌و‌پاسخ داخل یک پرونده ──
    // Route::prefix('/{case}/messages')->group(function () {
    //     Route::get('/', [CaseMessageController::class, 'index']);
    //     Route::post('/', [CaseMessageController::class, 'store']);
    // });

    // // ── تخصیص پرونده به کارشناس (فقط کارشناس/ادمین، چک در Policy) ──
    // Route::post('/{case}/assign', [CaseController::class, 'assign']);
    // Route::post('/{case}/close', [CaseController::class, 'close']);
});
