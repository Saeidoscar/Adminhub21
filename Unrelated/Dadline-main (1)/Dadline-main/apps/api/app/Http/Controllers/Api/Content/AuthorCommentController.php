<?php

namespace App\Http\Controllers\Api\Content;

use App\Actions\Content\CreateCommentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Blog;
use App\Models\Story;
use Illuminate\Http\JsonResponse;

class AuthorCommentController extends Controller
{
    public function forStory(StoreCommentRequest $request, Story $story, CreateCommentAction $action): JsonResponse
    {
        Story::query()->published()->whereKey($story->getKey())->firstOrFail();

        return (new CommentResource($action->execute($story, $request->user(), $request->validated())))
            ->response()->setStatusCode(201);
    }

    public function forBlog(StoreCommentRequest $request, Blog $blog, CreateCommentAction $action): JsonResponse
    {
        Blog::query()->published()->whereKey($blog->getKey())->firstOrFail();

        return (new CommentResource($action->execute($blog, $request->user(), $request->validated())))
            ->response()->setStatusCode(201);
    }
}
