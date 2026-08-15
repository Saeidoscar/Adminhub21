<?php

namespace App\Actions\Reviews;

use App\Models\Contract;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SubmitReviewAction
{
    public function execute(User $reviewer, Contract $contract, array $data): Review
    {
        return DB::transaction(function () use ($reviewer, $contract, $data): Review {
            $review = new Review($data);
            $review->user_id = $reviewer->id;
            $review->target_user_id = $contract->client_id;
            $review->contract_id = $contract->id;
            $review->save();

            return $review->load(['user', 'targetUser', 'contract']);
        });
    }
}
