<?php

namespace App\Actions\Affiliates;

use App\Models\Affiliate;
use App\Models\User;
use Illuminate\Support\Str;

class GenerateReferralCodeAction
{
    public function execute(User $user): Affiliate
    {
        return Affiliate::query()->create([
            'user_id' => $user->id,
            'referral_code' => strtoupper(Str::random(6)),
            'commission_rate' => '0.1000',
            'status' => 'active',
        ]);
    }
}
