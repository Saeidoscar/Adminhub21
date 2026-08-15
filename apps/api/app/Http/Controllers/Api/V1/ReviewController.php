<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Reviews\SubmitReviewAction;
use App\Actions\Reviews\RecalculateReviewAveragesAction;
use App\Http\Requests\Api\V1\StoreReviewRequest;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(
        private readonly SubmitReviewAction $submitReview,
        private readonly RecalculateReviewAveragesAction $recalculateAverages,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $reviews = Review::query()
            ->where('target_user_id', $request->user()->id)
            ->with(['user', 'contract'])
            ->paginate();

        return response()->json($reviews);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $review = $this->submitReview->execute(
            $request->user(),
            $request->user(),
            $request->validated()
        );

        return response()->json($review, 201);
    }

    public function recalculate(User $user): JsonResponse
    {
        $this->recalculateAverages->execute($user);

        return response()->json(['message' => 'Review averages recalculated']);
    }
}
