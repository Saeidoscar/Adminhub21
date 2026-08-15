<?php

namespace App\Http\Controllers\Api\Content;

use App\Actions\Content\SaveStoryAction;
use App\Actions\Content\TransitionContentStatusAction;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\ContentIndexRequest;
use App\Http\Requests\Content\UpsertStoryRequest;
use App\Http\Resources\StoryResource;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AuthorStoryController extends Controller
{
    public function index(ContentIndexRequest $request): AnonymousResourceCollection
    {
        $stories = $request->user()->stories()
            ->with(['author', 'legalCategory', 'featuredImage', 'tags'])
            ->latest('updated_at')
            ->paginate($request->integer('per_page', 20));

        return StoryResource::collection($stories);
    }

    public function store(UpsertStoryRequest $request, SaveStoryAction $action): JsonResponse
    {
        $story = $action->execute(null, $request->user(), $request->validated());

        return (new StoryResource($story))->response()->setStatusCode(201);
    }

    public function update(UpsertStoryRequest $request, Story $story, SaveStoryAction $action): StoryResource
    {
        $this->ensureOwner($request->user()->getKey(), $story);
        abort_unless(in_array($story->status, [ContentStatus::Draft, ContentStatus::Rejected], true), 409);

        return new StoryResource($action->execute($story, $request->user(), $request->validated()));
    }

    public function submit(Story $story, TransitionContentStatusAction $action): StoryResource
    {
        $this->ensureOwner(request()->user()->getKey(), $story);

        if ($story->status === ContentStatus::Rejected) {
            $story = $action->execute($story, ContentStatus::Draft);
        }

        return new StoryResource($action->execute($story, ContentStatus::Pending));
    }

    public function destroy(Story $story): JsonResponse
    {
        $this->ensureOwner(request()->user()->getKey(), $story);
        abort_unless(in_array($story->status, [ContentStatus::Draft, ContentStatus::Rejected], true), 409);
        $story->delete();

        return response()->json(status: 204);
    }

    private function ensureOwner(int $userId, Story $story): void
    {
        abort_unless($story->user_id === $userId, 404);
    }
}
