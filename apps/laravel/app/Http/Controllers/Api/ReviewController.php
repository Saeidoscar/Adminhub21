<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Models\AdminProfile;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::query()
            ->join('admin_profiles', 'reviews.admin_id', '=', 'admin_profiles.id')
            ->join('users', 'admin_profiles.user_id', '=', 'users.id')
            ->select(
                'reviews.*',
                'users.name_en as adminNameEn',
                'users.name_fa as adminNameFa'
            );

        if ($request->filled('adminId')) {
            $query->where('reviews.admin_id', $request->query('adminId'));
        }

        if ($request->filled('employerId')) {
            $query->where('reviews.employer_id', $request->query('employerId'));
        }

        $reviews = $query
            ->orderByDesc('reviews.created_at')
            ->get()
            ->map(fn ($review) => $this->formatReview($review));

        return response()->json(['reviews' => $reviews]);
    }

    public function show(string $id): JsonResponse
    {
        $review = Review::query()
            ->join('admin_profiles', 'reviews.admin_id', '=', 'admin_profiles.id')
            ->join('users', 'admin_profiles.user_id', '=', 'users.id')
            ->where('reviews.id', $id)
            ->select(
                'reviews.*',
                'users.name_en as adminNameEn',
                'users.name_fa as adminNameFa'
            )
            ->first();

        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }

        $employer = User::find($review->employer_id);
        $employerName = $employer?->name_fa ?: ($employer?->name_en ?: '');

        return response()->json(['review' => $this->formatReview($review, $employerName)]);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $user = Auth::user();
        $data = $request->validated();

        $employer = User::find($user->id);
        $employerName = $employer?->name_fa ?: ($employer?->name_en ?: '');

        $admin = User::join('admin_profiles', 'users.id', '=', 'admin_profiles.user_id')
            ->where('admin_profiles.id', $data['adminId'])
            ->select('users.name_en', 'users.name_fa')
            ->first();

        $review = Review::create([
            'admin_id' => $data['adminId'],
            'employer_id' => $user->id,
            'contract_id' => $data['contractId'] ?? null,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        return response()->json([
            'review' => [
                'id' => (string) $review->id,
                'adminId' => (string) $review->admin_id,
                'adminNameEn' => $admin->name_en ?? '',
                'adminNameFa' => $admin->name_fa ?? '',
                'employerId' => (string) $review->employer_id,
                'employerName' => $employerName,
                'contractId' => $review->contract_id ? (string) $review->contract_id : null,
                'rating' => (int) $review->rating,
                'comment' => $review->comment,
                'createdAt' => $review->created_at?->toISOString(),
            ],
        ], 201);
    }

    private function formatReview($review, ?string $employerName = null): array
    {
        if ($employerName === null) {
            $employer = User::find($review->employer_id);
            $employerName = $employer?->name_fa ?: ($employer?->name_en ?: '');
        }

        return [
            'id' => (string) $review->id,
            'adminId' => (string) $review->admin_id,
            'adminNameEn' => $review->adminNameEn ?? '',
            'adminNameFa' => $review->adminNameFa ?? '',
            'employerId' => (string) $review->employer_id,
            'employerName' => $employerName,
            'contractId' => $review->contract_id ? (string) $review->contract_id : null,
            'rating' => (int) $review->rating,
            'comment' => $review->comment,
            'createdAt' => $review->created_at?->toISOString(),
        ];
    }
}
