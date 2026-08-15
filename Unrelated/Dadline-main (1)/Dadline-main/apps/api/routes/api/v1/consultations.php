<?php

use App\Http\Controllers\Api\Questions\ProviderQuestionController;
use App\Http\Controllers\Api\Questions\QuestionReviewController;
use App\Http\Controllers\Api\Questions\UserQuestionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Legal questions — authenticated user/provider workflows
|--------------------------------------------------------------------------
| Public, indexable question pages remain in list.php and single.php.
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/questions/me', [UserQuestionController::class, 'index'])
        ->name('questions.me.index');
    Route::get('/questions/meta', [UserQuestionController::class, 'meta'])
        ->name('questions.meta');
    Route::post('/questions', [UserQuestionController::class, 'store'])
        ->name('questions.store');
    Route::get('/questions/me/{uuid}', [UserQuestionController::class, 'show'])
        ->whereUuid('uuid')
        ->name('questions.me.show');
    Route::post('/questions/me/{uuid}/answers/{answerId}/review', [QuestionReviewController::class, 'store'])
        ->whereUuid('uuid')
        ->whereNumber('answerId')
        ->name('questions.me.answers.review.store');

    Route::get('/questions/provider', [ProviderQuestionController::class, 'index'])
        ->name('questions.provider.index');
    Route::get('/questions/provider/{uuid}', [ProviderQuestionController::class, 'show'])
        ->whereUuid('uuid')
        ->name('questions.provider.show');
    Route::post('/questions/provider/{uuid}/answers', [ProviderQuestionController::class, 'answer'])
        ->whereUuid('uuid')
        ->name('questions.provider.answers.store');
});
