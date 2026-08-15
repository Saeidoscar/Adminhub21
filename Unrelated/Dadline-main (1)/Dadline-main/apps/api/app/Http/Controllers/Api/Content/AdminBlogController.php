<?php

namespace App\Http\Controllers\Api\Content;

use App\Actions\Content\SaveBlogAction;
use App\Actions\Content\TransitionContentStatusAction;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\ContentIndexRequest;
use App\Http\Requests\Content\TransitionContentRequest;
use App\Http\Requests\Content\UpsertBlogRequest;
use App\Http\Resources\BlogResource;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminBlogController extends Controller
{
    public function index(ContentIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $blogs = Blog::query()
            ->with(['author', 'legalCategory', 'featuredImage', 'tags'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['category'] ?? null, fn ($query, $slug) => $query->whereHas('legalCategory', fn ($q) => $q->where('slug', $slug)))
            ->latest('updated_at')
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();

        return BlogResource::collection($blogs);
    }

    public function store(UpsertBlogRequest $request, SaveBlogAction $action): JsonResponse
    {
        $blog = $action->execute(null, $request->user(), $request->validated());

        return (new BlogResource($blog))->response()->setStatusCode(201);
    }

    public function show(Blog $blog): BlogResource
    {
        return new BlogResource($blog->load(['author', 'legalCategory', 'featuredImage', 'tags']));
    }

    public function update(UpsertBlogRequest $request, Blog $blog, SaveBlogAction $action): BlogResource
    {
        return new BlogResource($action->execute($blog, $request->user(), $request->validated()));
    }

    public function transition(TransitionContentRequest $request, Blog $blog, TransitionContentStatusAction $action): BlogResource
    {
        return new BlogResource($action->execute(
            $blog,
            ContentStatus::from($request->validated('status')),
            $request->safe()->only(['rejection_reason', 'published_at']),
        ));
    }

    public function destroy(Blog $blog): JsonResponse
    {
        $blog->delete();

        return response()->json(status: 204);
    }
}
