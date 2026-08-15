<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ContentController;

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
