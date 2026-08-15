<?php

use App\Http\Controllers\Api\Web\Public\LegalProviderController;
use App\Http\Controllers\Api\Web\Public\PublicQuestionController;
use App\Http\Controllers\Public\LegalCategoryController;
use App\Http\Controllers\Public\LocationController;
use App\Http\Controllers\Public\ReviewController;
use Illuminate\Support\Facades\Route;

Route::get('/legal-providers', [LegalProviderController::class, 'index']);
Route::get('/questions', [PublicQuestionController::class, 'index'])->name('questions.index');
Route::get('/legal-categories', [LegalCategoryController::class, 'index']);
Route::get('/locations', [LocationController::class, 'index']);
Route::get('/reviews', [ReviewController::class, 'index']);
