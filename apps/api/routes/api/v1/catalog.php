<?php

use App\Http\Controllers\Api\V1\CatalogController;
use Illuminate\Support\Facades\Route;

Route::get('/catalog/tools', [CatalogController::class, 'tools']);
Route::get('/catalog/editors', [CatalogController::class, 'editors']);
Route::get('/catalog/vibe-coders', [CatalogController::class, 'vibeCoders']);
