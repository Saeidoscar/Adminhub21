<?php

namespace App\Actions\Marketplace;

use App\Enums\ProductType;
use App\Models\LegalCategory;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListPublicProductsAction
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array{
     *     products: LengthAwarePaginator,
     *     filters: array{
     *         total: int,
     *         types: array<int, array{type: string, count: int}>,
     *         categories: array<int, array{name: string, slug: string, count: int}>
     *     }
     * }
     */
    public function execute(array $filters): array
    {
        $publishedProducts = Product::query()->published();
        if ($filters['vendor'] ?? null) {
            $publishedProducts->whereHas(
                'vendor.vendorProfile',
                fn (Builder $vendorQuery): Builder => $vendorQuery->where('slug', $filters['vendor'])
            );
        }

        $filterRows = (clone $publishedProducts)->get(['product_type', 'category_id']);
        $typeCounts = $filterRows->countBy(
            fn (Product $product): string => $product->product_type->value
        );
        $categoryCounts = $filterRows
            ->whereNotNull('category_id')
            ->countBy('category_id');

        $categories = LegalCategory::query()
            ->whereIn('id', $categoryCounts->keys())
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (LegalCategory $category): array => [
                'name' => $category->name,
                'slug' => $category->slug,
                'count' => (int) $categoryCounts->get($category->getKey(), 0),
            ])
            ->values()
            ->all();

        $products = Product::query()
            ->published()
            ->with([
                'vendor:id,first_name,last_name,role',
                'vendor.vendorProfile:user_id,slug,vendor_type',
                'vendor.profile:user_id,avatar_id',
                'vendor.profile.avatar:id,storage_key',
                'legalCategory:id,name,slug',
            ])
            ->when(
                $filters['type'] ?? null,
                fn (Builder $query, string $type): Builder => $query->where('product_type', $type)
            )
            ->when(
                $filters['category'] ?? null,
                fn (Builder $query, string $category): Builder => $query->whereHas(
                    'legalCategory',
                    fn (Builder $categoryQuery): Builder => $categoryQuery->where('slug', $category)
                )
            )
            ->when(
                $filters['vendor'] ?? null,
                fn (Builder $query, string $vendor): Builder => $query->whereHas(
                    'vendor.vendorProfile',
                    fn (Builder $vendorQuery): Builder => $vendorQuery->where('slug', $vendor)
                )
            )
            ->when(
                $filters['search'] ?? null,
                fn (Builder $query, string $search): Builder => $query->where('title', 'like', "%{$search}%")
            );

        $this->applySort($products, $filters['sort'] ?? 'best-selling');

        return [
            'products' => $products
                ->orderByDesc('id')
                ->paginate($filters['per_page'] ?? 24)
                ->withQueryString(),
            'filters' => [
                'total' => $filterRows->count(),
                'types' => collect(ProductType::cases())
                    ->map(fn (ProductType $type): array => [
                        'type' => $type->value,
                        'count' => (int) $typeCounts->get($type->value, 0),
                    ])
                    ->all(),
                'categories' => $categories,
            ],
        ];
    }

    private function applySort(Builder $query, string $sort): void
    {
        match ($sort) {
            'price-desc' => $query->orderByDesc('price'),
            'price-asc' => $query->orderBy('price'),
            default => $query->orderByDesc('sales_count'),
        };
    }
}
