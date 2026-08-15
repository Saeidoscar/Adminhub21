<?php

namespace App\Actions\Packages;

use App\Models\Package;
use App\Models\PackagePlatformConfig;
use Illuminate\Support\Facades\DB;

class ValidatePlatformConfigsAction
{
    /**
     * @param  array<int, array{platform: string, posts_per_month?: int|null, stories_per_month?: int|null, reels_per_month?: int|null, comments_per_month?: int|null}>  $configs
     */
    public function execute(Package $package, array $configs): Package
    {
        return DB::transaction(function () use ($package, $configs): Package {
            $package->platformConfigs()->delete();

            foreach ($configs as $config) {
                $package->platformConfigs()->create($config);
            }

            return $package->load(['platformConfigs']);
        });
    }
}
