<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\CatalogController;

Route::get('/catalog/tools', [CatalogController::class, 'tools']);
Route::get('/catalog/editors', [CatalogController::class, 'editors']);
Route::get('/catalog/vibe-coders', [CatalogController::class, 'vibeCoders']);
