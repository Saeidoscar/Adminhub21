<?php

namespace App\Http\Controllers\Api\Content;

use App\Actions\Content\TransitionContentStatusAction;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\ContentIndexRequest;
use App\Http\Requests\Content\TransitionContentRequest;
use App\Http\Resources\StoryResource;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminStoryController extends Controller
{
    public function index(ContentIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $stories = Story::query()
            ->with(['author', 'legalCategory', 'featuredImage', 'tags'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['category'] ?? null, fn ($query, $slug) => $query->whereHas('legalCategory', fn ($q) => $q->where('slug', $slug)))
            ->latest('updated_at')
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();

        return StoryResource::collection($stories);
    }

    public function show(Story $story): StoryResource
    {
        return new StoryResource($story->load(['author', 'legalCategory', 'featuredImage', 'tags']));
    }

    public function transition(TransitionContentRequest $request, Story $story, TransitionContentStatusAction $action): StoryResource
    {
        return new StoryResource($action->execute(
            $story,
            ContentStatus::from($request->validated('status')),
            $request->safe()->only(['rejection_reason', 'published_at']),
        ));
    }

    public function destroy(Story $story): JsonResponse
    {
        $story->delete();

        return response()->json(status: 204);
    }
}
