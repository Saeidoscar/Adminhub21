<?php

namespace App\Actions\Packages;

use App\Models\Package;

class TogglePackageStatusAction
{
    public function execute(Package $package, string $status): Package
    {
        $package->status = $status;
        $package->save();

        return $package;
    }
}
