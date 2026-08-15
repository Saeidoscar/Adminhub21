<?php

use App\Http\Controllers\Api\Content\AdminBlogController;
use App\Http\Controllers\Api\Content\AdminCommentController;
use App\Http\Controllers\Api\Content\AdminStoryController;
use App\Http\Controllers\Api\Content\AdminTagController;
use App\Http\Controllers\Api\Content\AuthorCommentController;
use App\Http\Controllers\Api\Content\AuthorStoryController;
use App\Http\Controllers\Api\Content\ContentReactionController;
use App\Http\Controllers\Api\Content\PublicBlogController;
use App\Http\Controllers\Api\Content\PublicCommentController;
use App\Http\Controllers\Api\Content\PublicContentStatsController;
use App\Http\Controllers\Api\Content\PublicStoryController;
use App\Http\Controllers\Api\Content\PublicTagController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:public-api')->group(function () {
    Route::get('/content/stats', PublicContentStatsController::class)->name('public.content.stats');
    Route::get('/stories', [PublicStoryController::class, 'index'])->name('public.stories.index');
    Route::get('/stories/{story}', [PublicStoryController::class, 'show'])->name('public.stories.show');
    Route::post('/stories/{story}/view', [PublicStoryController::class, 'trackView'])->name('public.stories.view');
    Route::get('/stories/{story}/comments', [PublicCommentController::class, 'forStory'])->name('public.stories.comments.index');

    Route::get('/blogs', [PublicBlogController::class, 'index'])->name('public.blogs.index');
    Route::get('/blogs/{blog}', [PublicBlogController::class, 'show'])->name('public.blogs.show');
    Route::post('/blogs/{blog}/view', [PublicBlogController::class, 'trackView'])->name('public.blogs.view');
    Route::get('/blogs/{blog}/comments', [PublicCommentController::class, 'forBlog'])->name('public.blogs.comments.index');

    Route::get('/tags', [PublicTagController::class, 'index'])->name('public.tags.index');
    Route::get('/tags/{tag}', [PublicTagController::class, 'show'])->name('public.tags.show');
    Route::get('/tags/{tag}/stories', [PublicTagController::class, 'stories'])->name('public.tags.stories.index');
    Route::get('/tags/{tag}/blogs', [PublicTagController::class, 'blogs'])->name('public.tags.blogs.index');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me/stories', [AuthorStoryController::class, 'index'])->name('author.stories.index');
    Route::post('/stories', [AuthorStoryController::class, 'store'])->name('author.stories.store');
    Route::patch('/stories/{story}', [AuthorStoryController::class, 'update'])->name('author.stories.update');
    Route::delete('/stories/{story}', [AuthorStoryController::class, 'destroy'])->name('author.stories.destroy');
    Route::post('/stories/{story}/submit', [AuthorStoryController::class, 'submit'])->name('author.stories.submit');

    Route::post('/stories/{story}/comments', [AuthorCommentController::class, 'forStory'])->name('author.stories.comments.store');
    Route::post('/blogs/{blog}/comments', [AuthorCommentController::class, 'forBlog'])->name('author.blogs.comments.store');
    Route::get('/stories/{story}/reaction', [ContentReactionController::class, 'storyStatus'])->name('author.stories.reaction.show');
    Route::post('/stories/{story}/reaction', [ContentReactionController::class, 'forStory'])->name('author.stories.reaction.store');
    Route::get('/blogs/{blog}/reaction', [ContentReactionController::class, 'blogStatus'])->name('author.blogs.reaction.show');
    Route::post('/blogs/{blog}/reaction', [ContentReactionController::class, 'forBlog'])->name('author.blogs.reaction.store');
});

Route::prefix('admin/content')
    ->middleware(['auth:sanctum', 'role:admin,manager,editor'])
    ->name('admin.content.')
    ->group(function () {
        Route::get('/stories', [AdminStoryController::class, 'index'])->name('stories.index');
        Route::get('/stories/{story}', [AdminStoryController::class, 'show'])->name('stories.show');
        Route::patch('/stories/{story}/status', [AdminStoryController::class, 'transition'])->name('stories.status');
        Route::delete('/stories/{story}', [AdminStoryController::class, 'destroy'])->name('stories.destroy');

        Route::get('/blogs', [AdminBlogController::class, 'index'])->name('blogs.index');
        Route::post('/blogs', [AdminBlogController::class, 'store'])->name('blogs.store');
        Route::get('/blogs/{blog}', [AdminBlogController::class, 'show'])->name('blogs.show');
        Route::patch('/blogs/{blog}', [AdminBlogController::class, 'update'])->name('blogs.update');
        Route::patch('/blogs/{blog}/status', [AdminBlogController::class, 'transition'])->name('blogs.status');
        Route::delete('/blogs/{blog}', [AdminBlogController::class, 'destroy'])->name('blogs.destroy');

        Route::get('/tags', [AdminTagController::class, 'index'])->name('tags.index');
        Route::post('/tags', [AdminTagController::class, 'store'])->name('tags.store');
        Route::patch('/tags/{tag}', [AdminTagController::class, 'update'])->name('tags.update');
        Route::delete('/tags/{tag}', [AdminTagController::class, 'destroy'])->name('tags.destroy');

        Route::get('/comments', [AdminCommentController::class, 'index'])->name('comments.index');
        Route::patch('/comments/{comment}', [AdminCommentController::class, 'update'])->name('comments.update');
        Route::delete('/comments/{comment}', [AdminCommentController::class, 'destroy'])->name('comments.destroy');
    });
