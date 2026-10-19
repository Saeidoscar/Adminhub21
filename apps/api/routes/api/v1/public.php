<?php

use App\Http\Controllers\Api\V1\PublicController;
use Illuminate\Support\Facades\Route;

Route::get('/marketplace/packages', [PublicController::class, 'packages']);
Route::get('/marketplace/packages/{ref}', [PublicController::class, 'package']);
Route::get('/marketplace/profiles/{id}', [PublicController::class, 'profile'])->whereNumber('id');
Route::get('/marketplace/search', [PublicController::class, 'search']);
Route::get('/marketplace/categories', [PublicController::class, 'categories']);
