<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Editor;
use App\Models\Tool;
use App\Models\VibeCoder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogController extends Controller
{
    public function tools(Request $request): JsonResponse
    {
        $query = Tool::query()->where('active', true);

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($request->filled('popular')) {
            $query->where('popular', filter_var($request->query('popular'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('minRating')) {
            $query->where('rating', '>=', (float) $request->query('minRating'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('desc_en', 'ilike', "%{$search}%")
                  ->orWhere('desc_fa', 'ilike', "%{$search}%");
            });
        }

        $tools = $query
            ->orderByDesc('popular')
            ->orderByDesc('rating')
            ->orderByDesc('reviews')
            ->get()
            ->map(fn ($tool) => [
                'id' => (string) $tool->id,
                'name' => $tool->name,
                'descEn' => $tool->desc_en,
                'descFa' => $tool->desc_fa,
                'category' => $tool->category,
                'icon' => $tool->icon,
                'rating' => (float) $tool->rating,
                'reviews' => (int) $tool->reviews,
                'popular' => (bool) $tool->popular,
                'priceToman' => (int) $tool->price_toman,
                'priceUSD' => (int) $tool->price_usd,
                'active' => (bool) $tool->active,
                'createdAt' => $tool->created_at?->toISOString(),
                'updatedAt' => $tool->updated_at?->toISOString(),
            ]);

        return response()->json(['tools' => $tools]);
    }

    public function editors(Request $request): JsonResponse
    {
        $query = Editor::query()->where('active', true);

        if ($request->filled('specialty')) {
            $query->where('specialty', $request->query('specialty'));
        }

        if ($request->filled('minRating')) {
            $query->where('rating', '>=', (float) $request->query('minRating'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'ilike', "%{$search}%")
                  ->orWhere('name_fa', 'ilike', "%{$search}%")
                  ->orWhere('bio_en', 'ilike', "%{$search}%")
                  ->orWhere('bio_fa', 'ilike', "%{$search}%");
            });
        }

        $editors = $query
            ->orderByDesc('rating')
            ->orderByDesc('reviews')
            ->get()
            ->map(fn ($editor) => [
                'id' => (string) $editor->id,
                'nameEn' => $editor->name_en,
                'nameFa' => $editor->name_fa,
                'photo' => $editor->photo,
                'specialty' => $editor->specialty,
                'rating' => (float) $editor->rating,
                'reviews' => (int) $editor->reviews,
                'projects' => (int) $editor->projects,
                'delivery' => $editor->delivery,
                'rateToman' => (int) $editor->rate_toman,
                'rateUSD' => (int) $editor->rate_usd,
                'bioEn' => $editor->bio_en,
                'bioFa' => $editor->bio_fa,
                'active' => (bool) $editor->active,
                'createdAt' => $editor->created_at?->toISOString(),
                'updatedAt' => $editor->updated_at?->toISOString(),
            ]);

        return response()->json(['editors' => $editors]);
    }

    public function vibeCoders(Request $request): JsonResponse
    {
        $query = VibeCoder::query()->where('active', true);

        if ($request->filled('stack')) {
            $query->where('stack', $request->query('stack'));
        }

        if ($request->filled('minRating')) {
            $query->where('rating', '>=', (float) $request->query('minRating'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'ilike', "%{$search}%")
                  ->orWhere('name_fa', 'ilike', "%{$search}%")
                  ->orWhere('bio_en', 'ilike', "%{$search}%")
                  ->orWhere('bio_fa', 'ilike', "%{$search}%");
            });
        }

        $vibeCoders = $query
            ->orderByDesc('rating')
            ->orderByDesc('reviews')
            ->get()
            ->map(fn ($vc) => [
                'id' => (string) $vc->id,
                'nameEn' => $vc->name_en,
                'nameFa' => $vc->name_fa,
                'photo' => $vc->photo,
                'stack' => $vc->stack,
                'rating' => (float) $vc->rating,
                'reviews' => (int) $vc->reviews,
                'projects' => (int) $vc->projects,
                'rateToman' => (int) $vc->rate_toman,
                'rateUSD' => (int) $vc->rate_usd,
                'delivery' => $vc->delivery,
                'bioEn' => $vc->bio_en,
                'bioFa' => $vc->bio_fa,
                'active' => (bool) $vc->active,
                'createdAt' => $vc->created_at?->toISOString(),
                'updatedAt' => $vc->updated_at?->toISOString(),
            ]);

        return response()->json(['vibe-coders' => $vibeCoders]);
    }
}
