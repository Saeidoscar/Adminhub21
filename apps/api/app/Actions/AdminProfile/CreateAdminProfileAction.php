<?php

namespace App\Actions\AdminProfile;

use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateAdminProfileAction
{
    public function execute(User $user, array $data): AdminProfile
    {
        return DB::transaction(function () use ($user, $data): AdminProfile {
            $profile = new AdminProfile($data);
            $profile->user_id = $user->id;
            $profile->save();

            return $profile->load(['user', 'photo', 'insuranceDocument']);
        });
    }
}
