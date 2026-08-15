<?php

use App\Http\Controllers\Api\Web\Public\LegalProviderProfileController;
use App\Http\Controllers\Api\Web\Public\PublicQuestionController;
use Illuminate\Support\Facades\Route;

Route::get('/legal-providers/{type}/{slug}', [LegalProviderProfileController::class, 'show']);
Route::get('/questions/{slug}', [PublicQuestionController::class, 'show'])->name('questions.show');
