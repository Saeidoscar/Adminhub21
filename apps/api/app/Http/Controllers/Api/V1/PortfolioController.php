<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Portfolio\PortfolioService;
use App\Models\Portfolio;
use App\Models\PortfolioItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function __construct(
        private readonly PortfolioService $portfolioService,
    ) {}

    public function index($userId): JsonResponse
    {
        $portfolios = Portfolio::query()
            ->where('user_id', $userId)
            ->with(['items'])
            ->paginate();

        return response()->json($portfolios);
    }

    public function show($id): JsonResponse
    {
        $item = PortfolioItem::query()
            ->with(['portfolio', 'user'])
            ->findOrFail($id);

        return response()->json($item);
    }

    public function store(Request $request): JsonResponse
    {
        $portfolio = $this->portfolioService->create($request->user(), $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
        ]));

        return response()->json($portfolio, 201);
    }

    public function update(Request $request, Portfolio $portfolio): JsonResponse
    {
        $portfolio->update($request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
        ]));

        return response()->json($portfolio);
    }

    public function destroy(Portfolio $portfolio): JsonResponse
    {
        $portfolio->delete();

        return response()->json(null, 204);
    }

    public function uploadMedia(Request $request, Portfolio $portfolio): JsonResponse
    {
        $request->validate([
            'media' => ['required', 'array'],
        ]);

        $media = $this->portfolioService->updateMedia($portfolio, $request->validated('media'));

        return response()->json($media);
    }
}
