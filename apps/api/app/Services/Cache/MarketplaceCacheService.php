<?php

namespace App\Services\Cache;

use App\Models\AiModel;
use App\Models\Package;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MarketplaceCacheService
{
    private const PREFIX = 'marketplace:';

    private const TTL = 3600;

    public function getActiveListings(int $perPage = 20): Collection
    {
        $cacheKey = self::PREFIX . "listings:page:{$perPage}";

        return Cache::tags(['listings'])->remember($cacheKey, self::TTL, function () {
            return User::whereHas('packages', function ($query) {
                $query->where('status', 'published');
            })
                ->with(['packages' => function ($query) {
                    $query->where('status', 'published')
                        ->with('platformConfigs');
                }])
                ->paginate($perPage)
                ->getCollection();
        });
    }

    public function getFeaturedListings(int $limit = 10): Collection
    {
        $cacheKey = self::PREFIX . "featured:{$limit}";

        return Cache::tags(['listings', 'featured'])->remember($cacheKey, self::TTL, function () {
            return User::whereHas('packages', function ($query) {
                $query->where('status', 'published');
            })
                ->withAvg('reviews', 'rating')
                ->withCount('reviews')
                ->orderByDesc('reviews_avg_rating')
                ->limit($limit)
                ->get();
        });
    }

    public function getCategories(): Collection
    {
        $cacheKey = self::PREFIX . 'categories';

        return Cache::tags(['categories'])->remember($cacheKey, self::TTL * 24, function () {
            return \App\Models\Tag::whereNull('parentId')
                ->withCount('stories')
                ->orderByDesc('stories_count')
                ->get();
        });
    }

    public function getPackageWithRelations(int $packageId): ?Package
    {
        $cacheKey = self::PREFIX . "package:{$packageId}";

        return Cache::tags(['packages'])->remember($cacheKey, self::TTL, function () use ($packageId) {
            return Package::with(['user.adminProfile', 'platformConfigs', 'reviews'])
                ->find($packageId);
        });
    }

    public function clearListingsCache(): void
    {
        Cache::tags(['listings'])->flush();
        Log::info('Listings cache cleared');
    }

    public function clearPackageCache(int $packageId): void
    {
        Cache::tags(['packages'])->flush();
        Cache::tags(['listings'])->flush();
        Log::info("Package cache cleared for ID: {$packageId}");
    }
}
