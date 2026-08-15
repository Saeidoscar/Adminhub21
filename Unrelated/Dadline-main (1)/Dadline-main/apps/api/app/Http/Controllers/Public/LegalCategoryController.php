<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\LegalCategoryResource;
use App\Models\LegalCategory;

class LegalCategoryController extends Controller
{
    public function index()
    {
        $categories = LegalCategory::query()
            ->whereNull('parent_id')
            ->with('children')
            ->get();

        return LegalCategoryResource::collection($categories);
    }
}
