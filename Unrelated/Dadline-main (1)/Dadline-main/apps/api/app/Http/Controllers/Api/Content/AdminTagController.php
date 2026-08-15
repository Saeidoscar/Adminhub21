<?php

namespace App\Http\Controllers\Api\Content;

use App\Actions\Content\SaveTagAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\UpsertTagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminTagController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return TagResource::collection(
            Tag::query()->withCount(['stories', 'blogs'])->orderBy('name')->get()
        );
    }

    public function store(UpsertTagRequest $request, SaveTagAction $action): JsonResponse
    {
        return (new TagResource($action->execute(null, $request->validated())))
            ->response()->setStatusCode(201);
    }

    public function update(UpsertTagRequest $request, Tag $tag, SaveTagAction $action): TagResource
    {
        return new TagResource($action->execute($tag, $request->validated()));
    }

    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();

        return response()->json(status: 204);
    }
}
