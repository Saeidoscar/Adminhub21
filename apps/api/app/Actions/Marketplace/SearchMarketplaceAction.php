<?php

namespace App\Actions\Marketplace;

use App\Enums\ContentStatus;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class SearchMarketplaceAction
{
    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, Package>
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        $query = Package::query()
            ->published()
            ->with(['user:id,name,avatar', 'platformConfigs'])
            ->when($filters['search'] ?? null, fn (Builder $q, string $search): Builder => $q->where('title', 'like', "%{$search}%"))
            ->when($filters['min_price'] ?? null, fn (Builder $q, float $price): Builder => $q->where('price', '>=', $price))
            ->when($filters['max_price'] ?? null, fn (Builder $q, float $price): Builder => $q->where('price', '<=', $price))
            ->when($filters['platform'] ?? null, fn (Builder $q, string $platform): Builder => $q->whereHas('platformConfigs', fn (Builder $pq): Builder => $pq->where('platform', $platform)))
            ->when($filters['sort'] ?? 'popular', function (Builder $q, string $sort): Builder {
                return match ($sort) {
                    'price-asc' => $q->orderBy('price'),
                    'price-desc' => $q->orderByDesc('price'),
                    'newest' => $q->orderByDesc('created_at'),
                    default => $q->orderByDesc('sales'),
                };
            });

        return $query->paginate($filters['per_page'] ?? 24)->withQueryString();
    }
}
