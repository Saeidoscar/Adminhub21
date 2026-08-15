<?php

namespace App\Actions\AdminProfile;

use App\Models\AdminProfile;
use Illuminate\Support\Facades\DB;

class UpdateAdminProfileAction
{
    public function execute(AdminProfile $profile, array $data): AdminProfile
    {
        return DB::transaction(function () use ($profile, $data): AdminProfile {
            $profile->fill($data);
            $profile->save();

            return $profile->load(['user', 'photo', 'insuranceDocument']);
        });
    }
}
