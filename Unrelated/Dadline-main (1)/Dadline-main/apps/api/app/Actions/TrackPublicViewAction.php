<?php

namespace App\Actions;

use App\Contracts\PubliclyViewable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Throwable;

class TrackPublicViewAction
{
    public function execute(Model&PubliclyViewable $viewable, string $viewerKey): bool
    {
        $publishedViewable = $viewable
            ->scopePublished($viewable->newQuery())
            ->whereKey($viewable->getKey())
            ->firstOrFail();

        $cache = Cache::store('redis');
        $cacheKey = sprintf(
            'public-views:%s:%s:%s',
            $viewable->viewCacheNamespace(),
            $publishedViewable->getKey(),
            hash('sha256', $viewerKey)
        );

        if (! $cache->add($cacheKey, true, now()->addDay())) {
            return false;
        }

        try {
            $publishedViewable
                ->newQuery()
                ->whereKey($publishedViewable->getKey())
                ->increment('views_count');
        } catch (Throwable $exception) {
            $cache->forget($cacheKey);

            throw $exception;
        }

        return true;
    }
}
