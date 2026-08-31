<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CommentController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/otp/send', [AuthController::class, 'sendOtp']);
Route::post('/auth/otp/verify', [AuthController::class, 'verifyOtp']);

    Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::middleware('role:admin,super_admin')->prefix('packages')->group(function () {
        Route::post('/', [PackageController::class, 'store']);
        Route::put('/{id}', [PackageController::class, 'update']);
        Route::delete('/{id}', [PackageController::class, 'destroy']);
    });

    Route::middleware('role:employer')->prefix('offers')->group(function () {
        Route::post('/', [OfferController::class, 'store']);
    });

    Route::get('/offers', [OfferController::class, 'index']);
    Route::get('/offers/{id}', [OfferController::class, 'show']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::middleware('role:employer')->prefix('favorites')->group(function () {
        Route::post('/{adminId}', [FavoriteController::class, 'store']);
        Route::delete('/{adminId}', [FavoriteController::class, 'destroy']);
    });

    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/reviews/{id}', [ReviewController::class, 'show']);

    Route::post('/stories', [StoryController::class, 'store']);
    Route::patch('/stories/{id}', [StoryController::class, 'update']);
    Route::delete('/stories/{id}', [StoryController::class, 'destroy']);

    Route::post('/blogs', [BlogController::class, 'store']);
    Route::patch('/blogs/{id}', [BlogController::class, 'update']);
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);

    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
});

Route::get('/packages', [PackageController::class, 'index']);
Route::get('/packages/{id}', [PackageController::class, 'show']);

Route::get('/stories', [StoryController::class, 'index']);
Route::get('/stories/{id}', [StoryController::class, 'show']);

Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);

Route::get('/comments', [CommentController::class, 'index']);
Route::get('/comments/{id}', [CommentController::class, 'show']);

Route::prefix('catalog')->group(function () {
    Route::get('/tools', [CatalogController::class, 'tools']);
    Route::get('/editors', [CatalogController::class, 'editors']);
    Route::get('/vibe-coders', [CatalogController::class, 'vibeCoders']);
});

Route::get('/test', function () {
    return response()->json(['ok' => true]);
});

Route::post('/test', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'contentType' => $request->header('Content-Type'),
        'hasBody' => $request->getContent() ? true : false,
        'body' => $request->getContent(),
        'all' => $request->all(),
    ]);
});
