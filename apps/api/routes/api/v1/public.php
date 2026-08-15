<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\PublicController;

Route::get('/marketplace/packages', [PublicController::class, 'packages']);
Route::get('/marketplace/packages/{id}', [PublicController::class, 'package'])->whereNumber('id');
Route::get('/marketplace/profiles/{id}', [PublicController::class, 'profile'])->whereNumber('id');
Route::get('/marketplace/search', [PublicController::class, 'search']);
Route::get('/marketplace/categories', [PublicController::class, 'categories']);
