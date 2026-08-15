<?php

namespace App\Actions\AdminProfile;

use App\Models\AdminProfile;
use Illuminate\Support\Facades\DB;

class ToggleVerificationAction
{
    public function execute(AdminProfile $profile, bool $verified): AdminProfile
    {
        return DB::transaction(function () use ($profile, $verified): AdminProfile {
            $profile->verified_at = $verified ? now() : null;
            $profile->save();

            return $profile;
        });
    }
}
