<?php

namespace App\Actions\Reviews;

use App\Enums\ReviewType;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpsertServiceReviewAction
{
    public function execute(
        User $reviewer,
        User $vendor,
        ReviewType $type,
        int $itemId,
        int $rate,
        string $review,
    ): Review {
        return DB::transaction(fn (): Review => Review::query()->updateOrCreate(
            [
                'reviewer_id' => $reviewer->id,
                'type' => $type->value,
                'item_id' => $itemId,
            ],
            [
                'vendor_id' => $vendor->id,
                'rate' => $rate,
                'review' => trim(strip_tags($review)),
                'status' => 'approved',
            ],
        ));
    }
}
