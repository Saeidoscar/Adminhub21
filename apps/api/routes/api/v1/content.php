<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ContentController;
use App\Http\Controllers\Api\V1\AdminContentController;

Route::get('/stories', [ContentController::class, 'stories']);
Route::get('/stories/{id}', [ContentController::class, 'showStory'])->whereNumber('id');
Route::get('/blogs', [ContentController::class, 'blogs']);
Route::get('/blogs/{slug}', [ContentController::class, 'showBlog']);
Route::get('/tags', [ContentController::class, 'tags']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/stories', [ContentController::class, 'storeStory']);
    Route::post('/blogs', [ContentController::class, 'storeBlog']);
    Route::post('/comments', [ContentController::class, 'storeComment']);
    Route::put('/comments/{id}', [ContentController::class, 'updateComment'])->whereNumber('id');
    Route::delete('/comments/{id}', [ContentController::class, 'deleteComment'])->whereNumber('id');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/content')->group(function () {
    Route::get('/stories', [AdminContentController::class, 'stories']);
    Route::patch('/stories/{id}', [AdminContentController::class, 'moderateStory'])->whereNumber('id');
    Route::get('/blogs', [AdminContentController::class, 'blogs']);
    Route::patch('/blogs/{id}', [AdminContentController::class, 'moderateBlog'])->whereNumber('id');
    Route::get('/comments', [AdminContentController::class, 'comments']);
    Route::delete('/comments/{id}', [AdminContentController::class, 'deleteComment'])->whereNumber('id');
});
