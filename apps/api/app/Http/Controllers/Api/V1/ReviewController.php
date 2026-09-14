<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Reviews\RecalculateReviewAveragesAction;
use App\Actions\Reviews\SubmitReviewAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreReviewRequest;
use App\Models\Contract;
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

    public function index(Request $request, $targetId): JsonResponse
    {
        $user = $request->user();
        if (! $user->hasRole('admin') && ! $user->hasRole('super_admin') && $user->id !== (int) $targetId) {
            abort(403, 'Unauthorized.');
        }

        $reviews = Review::query()
            ->where('target_user_id', $targetId)
            ->with(['user', 'contract'])
            ->paginate();

        return response()->json($reviews);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $contract = Contract::findOrFail($request->validated('contract_id'));
        $this->authorize('create', $contract);
        $this->authorize('view', $contract);

        $review = $this->submitReview->execute($request->user(), $contract, $request->validated());

        return response()->json($review, 201);
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        $this->authorize('update', $review);
        $review->update($request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string'],
            'media' => ['nullable', 'array'],
        ]));

        return response()->json($review->load(['user', 'targetUser', 'contract']));
    }

    public function destroy(Review $review): JsonResponse
    {
        $this->authorize('delete', $review);
        $review->delete();

        return response()->json(null, 204);
    }

    public function recalculate(User $user): JsonResponse
    {
        $this->authorize('recalculate', $user);
        $this->recalculateAverages->execute($user);

        return response()->json(['message' => 'Review averages recalculated']);
    }
}
