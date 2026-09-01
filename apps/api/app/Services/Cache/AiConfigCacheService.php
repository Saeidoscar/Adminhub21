<?php

namespace App\Services\Cache;

use App\Models\AiModel;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AiConfigCacheService
{
    private const PREFIX = 'ai:';

    private const TTL = 7200;

    public function getActiveModels(): Collection
    {
        $cacheKey = self::PREFIX . 'models:active';

        return Cache::tags(['ai', 'models'])->remember($cacheKey, self::TTL, function () {
            return AiModel::where('isActive', true)
                ->orderBy('provider')
                ->orderBy('name')
                ->get();
        });
    }

    public function getModelByCode(string $code): ?AiModel
    {
        $cacheKey = self::PREFIX . "model:{$code}";

        return Cache::tags(['ai', 'models'])->remember($cacheKey, self::TTL, function () use ($code) {
            return AiModel::where('code', $code)
                ->where('isActive', true)
                ->first();
        });
    }

    public function getModelsByProvider(string $provider): Collection
    {
        $cacheKey = self::PREFIX . "models:provider:{$provider}";

        return Cache::tags(['ai', 'models'])->remember($cacheKey, self::TTL, function () use ($provider) {
            return AiModel::where('provider', $provider)
                ->where('isActive', true)
                ->orderBy('name')
                ->get();
        });
    }

    public function getModelPricing(string $code): ?array
    {
        $cacheKey = self::PREFIX . "pricing:{$code}";

        return Cache::tags(['ai', 'pricing'])->remember($cacheKey, self::TTL * 12, function () use ($code) {
            $model = AiModel::where('code', $code)->first();
            if (!$model) {
                return null;
            }

            return [
                'input' => $model->inUsd,
                'output' => $model->outUsd,
                'currency' => 'USD',
            ];
        });
    }

    public function clearModelCache(): void
    {
        Cache::tags(['ai'])->flush();
        Log::info('AI model cache cleared');
    }

    public function clearModelCacheByCode(string $code): void
    {
        Cache::tags(['ai', 'models'])->flush();
        Cache::tags(['ai', 'pricing'])->flush();
        Log::info("AI model cache cleared for: {$code}");
    }
}
