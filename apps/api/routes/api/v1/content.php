<?php

use App\Http\Controllers\Api\V1\AdminContentController;
use App\Http\Controllers\Api\V1\ContentController;
use Illuminate\Support\Facades\Route;

Route::get('/stories', [ContentController::class, 'stories']);
Route::get('/stories/{id}', [ContentController::class, 'showStory'])->whereNumber('id');
Route::get('/blogs', [ContentController::class, 'blogs']);
Route::get('/blogs/{slug}', [ContentController::class, 'showBlog']);
Route::get('/tags', [ContentController::class, 'tags']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/stories', [ContentController::class, 'storeStory']);
    Route::post('/blogs', [ContentController::class, 'storeBlog']);
    Route::post('/comments', [ContentController::class, 'storeComment']);
    Route::put('/comments/{comment}', [ContentController::class, 'updateComment'])->whereNumber('comment');
    Route::delete('/comments/{comment}', [ContentController::class, 'deleteComment'])->whereNumber('comment');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/content')->group(function (): void {
    Route::get('/stories', [AdminContentController::class, 'stories']);
    Route::patch('/stories/{story}', [AdminContentController::class, 'moderateStory'])->whereNumber('story');
    Route::get('/blogs', [AdminContentController::class, 'blogs']);
    Route::patch('/blogs/{blog}', [AdminContentController::class, 'moderateBlog'])->whereNumber('blog');
    Route::get('/comments', [AdminContentController::class, 'comments']);
    Route::delete('/comments/{comment}', [AdminContentController::class, 'deleteComment'])->whereNumber('comment');
});
