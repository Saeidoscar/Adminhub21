<?php

namespace App\Actions\Reviews;

use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RecalculateReviewAveragesAction
{
    public function execute(User $user): void
    {
        DB::transaction(function () use ($user): void {
            $average = $user->reviewsReceived()
                ->whereNotNull('contract_id')
                ->avg('rating');

            if ($user->profile) {
                $user->profile->rating = round((float) $average, 2);
                $user->profile->save();
            }
        });
    }
}
