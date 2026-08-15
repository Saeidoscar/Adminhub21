<?php

namespace App\Http\Controllers\Api\Content;

use App\Actions\TrackPublicViewAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\ContentIndexRequest;
use App\Http\Requests\TrackPublicViewRequest;
use App\Http\Resources\StoryResource;
use App\Models\Story;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class PublicStoryController extends Controller
{
    public function index(ContentIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $stories = Story::query()
            ->published()
            ->with(['author', 'legalCategory', 'featuredImage', 'tags'])
            ->withCount(['comments' => fn ($query) => $query->approved()])
            ->when($filters['category'] ?? null, fn ($query, $slug) => $query->whereHas('legalCategory', fn ($q) => $q->where('slug', $slug)))
            ->when($filters['tag'] ?? null, fn ($query, $slug) => $query->whereHas('tags', fn ($q) => $q->where('slug', $slug)->where('is_active', true)))
            ->when($filters['author'] ?? null, fn ($query, $author) => $query->whereHas('author', fn ($q) => $this->applyAuthorSearch($q, $author)))
            ->when($filters['search'] ?? null, fn ($query, $search) => $this->applySearch($query, $search));

        $this->applySort($stories, $filters['sort'] ?? 'recent');

        $stories = $stories
            ->latest('id')
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();

        return StoryResource::collection($stories);
    }

    public function show(Story $story): StoryResource
    {
        $story = Story::query()
            ->published()
            ->whereKey($story->getKey())
            ->with(['author', 'legalCategory', 'featuredImage', 'tags'])
            ->withCount(['comments' => fn ($query) => $query->approved()])
            ->firstOrFail();

        return new StoryResource($story);
    }

    public function trackView(
        TrackPublicViewRequest $request,
        Story $story,
        TrackPublicViewAction $action
    ): Response {
        $action->execute($story, $request->viewerKey());

        return response()->noContent();
    }

    private function applySearch(Builder $query, string $search): Builder
    {
        return $query->where(function (Builder $query) use ($search): void {
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('excerpt', 'like', "%{$search}%")
                ->orWhereHas('author', fn ($author) => $this->applyAuthorSearch($author, $search))
                ->orWhereHas('legalCategory', fn ($category) => $category->where('name', 'like', "%{$search}%"));
        });
    }

    private function applyAuthorSearch(Builder $query, string $author): Builder
    {
        $author = trim(preg_replace('/\s+/u', ' ', $author) ?? $author);

        return $query->where(function (Builder $query) use ($author): void {
            $query->where('first_name', 'like', "%{$author}%")
                ->orWhere('last_name', 'like', "%{$author}%")
                ->orWhereRaw("CONCAT_WS(' ', first_name, last_name) LIKE ?", ["%{$author}%"]);
        });
    }

    private function applySort(Builder $query, string $sort): void
    {
        match ($sort) {
            'views' => $query->orderByDesc('views_count'),
            'likes' => $query->orderByDesc('likes_count'),
            'comments' => $query->orderByDesc('comments_count'),
            default => $query->orderByDesc('published_at'),
        };
    }
}
