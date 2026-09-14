<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Editor;
use App\Models\Tool;
use App\Models\VibeCoder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $this->applySearch($query, ['name', 'desc_en', 'desc_fa'], $request->query('search'));

        $tools = $query
            ->orderByDesc('popular')
            ->orderByDesc('rating')
            ->orderByDesc('reviews')
            ->get()
            ->map(fn (Tool $tool): array => [
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

        $this->applySearch($query, ['name_en', 'name_fa', 'bio_en', 'bio_fa'], $request->query('search'));

        $editors = $query
            ->orderByDesc('rating')
            ->orderByDesc('reviews')
            ->get()
            ->map(fn (Editor $editor): array => [
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

        $this->applySearch($query, ['name_en', 'name_fa', 'bio_en', 'bio_fa'], $request->query('search'));

        $vibeCoders = $query
            ->orderByDesc('rating')
            ->orderByDesc('reviews')
            ->get()
            ->map(fn (VibeCoder $vibeCoder): array => [
                'id' => (string) $vibeCoder->id,
                'nameEn' => $vibeCoder->name_en,
                'nameFa' => $vibeCoder->name_fa,
                'photo' => $vibeCoder->photo,
                'stack' => $vibeCoder->stack,
                'rating' => (float) $vibeCoder->rating,
                'reviews' => (int) $vibeCoder->reviews,
                'projects' => (int) $vibeCoder->projects,
                'rateToman' => (int) $vibeCoder->rate_toman,
                'rateUSD' => (int) $vibeCoder->rate_usd,
                'delivery' => $vibeCoder->delivery,
                'bioEn' => $vibeCoder->bio_en,
                'bioFa' => $vibeCoder->bio_fa,
                'active' => (bool) $vibeCoder->active,
                'createdAt' => $vibeCoder->created_at?->toISOString(),
                'updatedAt' => $vibeCoder->updated_at?->toISOString(),
            ]);

        return response()->json(['vibe-coders' => $vibeCoders]);
    }

    private function applySearch(Builder $query, array $columns, ?string $search): void
    {
        if ($search === null || trim($search) === '') {
            return;
        }

        $search = trim($search);

        $query->where(function (Builder $query) use ($columns, $search): void {
            foreach ($columns as $index => $column) {
                $sql = 'LOWER(CAST(' . $column . ' AS TEXT)) LIKE LOWER(?)';

                if ($index === 0) {
                    $query->whereRaw($sql, ['%' . $search . '%']);
                } else {
                    $query->orWhereRaw($sql, ['%' . $search . '%']);
                }
            }
        });
    }
}
