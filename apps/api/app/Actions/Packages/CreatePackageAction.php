<?php

namespace App\Actions\Packages;

use App\Models\Package;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreatePackageAction
{
    public function execute(User $user, array $data): Package
    {
        return DB::transaction(function () use ($user, $data): Package {
            $package = new Package($data);
            $package->user_id = $user->id;
            $package->save();

            return $package->load(['user', 'platformConfigs']);
        });
    }
}
