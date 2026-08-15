<?php

use App\Http\Controllers\Api\Contracts\PublicContractPreviewController;
use App\Http\Controllers\Api\Contracts\PublicContractVerificationController;
use App\Http\Controllers\Api\PublicPricingController;
use App\Http\Controllers\Api\Web\Public\CreateShortLinkController;
use App\Http\Controllers\Api\Web\Public\PublicProductController;
use App\Http\Controllers\Api\Web\Public\ShortLinkController;
use App\Http\Controllers\Public\FaqController;
use App\Http\Controllers\Public\LawyerController;
use App\Http\Controllers\Public\ReviewController;
use App\Http\Controllers\Public\ServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public — اطلاعات عمومی سایت، بدون نیاز به احراز هویت
|--------------------------------------------------------------------------
| این گروه throttle سبک‌تری می‌گیرد (پایین‌تر تعریف شده) و کاندید مناسبی
| برای response caching (Nginx/CDN) است چون داده‌ها یکسان برای همه است.
| مسیر نهایی: api.dadline.net/v1/public/...
*/

Route::prefix('public')->group(function () {
    Route::post('/short-links', CreateShortLinkController::class)
        ->middleware('throttle:600,1')
        ->name('public.short-links.store');

    Route::post('/short-links/{shortCode}/resolve', ShortLinkController::class)
        ->where('shortCode', '[A-Za-z0-9]{1,10}')
        ->middleware('throttle:6000,1')
        ->name('public.short-links.resolve');
});

Route::prefix('public')->middleware('throttle:public-api')->group(function () {

    Route::get('/pricing', PublicPricingController::class)
        ->name('public.pricing.show');
    Route::get('/contracts/preview/{contract:uuid}', [PublicContractPreviewController::class, 'show'])
        ->name('public.contracts.preview.show');
    Route::post('/contracts/preview/{contract:uuid}/verify-pin', [PublicContractPreviewController::class, 'verify'])
        ->name('public.contracts.preview.verify-pin');
    Route::get('/contracts/pricing', [PublicContractPreviewController::class, 'pricing'])
        ->name('public.contracts.pricing.show');
    Route::get('/contracts/{trackingCode}/verification', [PublicContractVerificationController::class, 'show'])
        ->where('trackingCode', 'DAD[0-9A-Za-z]+')
        ->name('public.contracts.verification.show');

    Route::get('/products', [PublicProductController::class, 'index'])
        ->name('public.products.index');
    Route::get('/products/{product}', [PublicProductController::class, 'show'])
        ->name('public.products.show');
    Route::post('/products/{product}/view', [PublicProductController::class, 'trackView'])
        ->name('public.products.view');

    // ── وکلا و کارشناسان حقوقی ──
    // Route::prefix('lawyers')->group(function () {
    //     Route::get('/', [LawyerController::class, 'index']);
    //     Route::get('/{lawyer}', [LawyerController::class, 'show']);
    //     Route::get('/{lawyer}/reviews', [ReviewController::class, 'forLawyer']);
    // });

    // // ── خدمات ──
    // Route::prefix('services')->group(function () {
    //     Route::get('/', [ServiceController::class, 'index']);
    //     Route::get('/{service}', [ServiceController::class, 'show']);
    // });

    // // ── سوالات متداول / محتوای عمومی ──
    // Route::prefix('faq')->group(function () {
    //     Route::get('/', [FaqController::class, 'index']);
    // });
});
