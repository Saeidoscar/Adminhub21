<?php

namespace App\Actions\Packages;

use App\Models\Package;
use Illuminate\Support\Facades\DB;

class UpdatePackageAction
{
    public function execute(Package $package, array $data): Package
    {
        return DB::transaction(function () use ($package, $data): Package {
            $package->fill($data);
            $package->save();

            return $package->load(['user', 'platformConfigs']);
        });
    }
}
