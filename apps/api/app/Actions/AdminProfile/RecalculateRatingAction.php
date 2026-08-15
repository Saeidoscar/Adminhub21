<?php

namespace App\Actions\AdminProfile;

use App\Models\AdminProfile;
use Illuminate\Support\Facades\DB;

class RecalculateRatingAction
{
    public function execute(AdminProfile $profile): AdminProfile
    {
        return DB::transaction(function () use ($profile): AdminProfile {
            $average = $profile->reviews()
                ->whereNotNull('contract_id')
                ->avg('rating');

            $profile->rating = round((float) $average, 2);
            $profile->save();

            return $profile;
        });
    }
}
