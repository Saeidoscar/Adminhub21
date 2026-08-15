<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\VendorProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'vendor' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Review::query()
            ->where('status', 'approved')
            ->latest('created_at')
            ->latest('id');

        if (filled($validated['vendor'] ?? null)) {
            $vendorId = VendorProfile::query()
                ->active()
                ->where('slug', $validated['vendor'])
                ->value('user_id');

            abort_if($vendorId === null, 404);

            $vendorReviewsQuery = $query->where('vendor_id', $vendorId);
            $stats = $this->statsForVendor($vendorReviewsQuery);

            $reviews = $vendorReviewsQuery
                ->paginate($validated['per_page'] ?? 10)
                ->withQueryString();

            return ReviewResource::collection($reviews)
                ->additional(['stats' => $stats]);
        }

        $reviews = $query
            ->with([
                'vendor.vendorProfile',
                'vendor.profile.avatar',
            ])
            ->limit(50)
            ->get();

        return ReviewResource::collection($reviews);
    }

    private function statsForVendor($query): array
    {
        $baseQuery = (clone $query)->reorder();

        $total = (clone $baseQuery)->count();
        $average = (float) ((clone $baseQuery)->avg('rate') ?? 0);
        $breakdown = (clone $baseQuery)
            ->selectRaw('type, COUNT(*) as reviews_count, AVG(rate) as average_rating')
            ->groupBy('type')
            ->orderByDesc('reviews_count')
            ->get()
            ->map(fn ($item) => [
                'type' => ReviewResource::typeLabelFor($item->type),
                'count' => (int) $item->reviews_count,
                'average' => round((float) $item->average_rating, 1),
            ])
            ->values();

        return [
            'total' => $total,
            'average' => round($average, 1),
            'breakdown' => $breakdown,
        ];
    }
}
