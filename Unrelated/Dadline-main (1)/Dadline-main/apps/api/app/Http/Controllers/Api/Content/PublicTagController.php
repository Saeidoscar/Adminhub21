<?php

namespace App\Http\Controllers\Api\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Content\ContentIndexRequest;
use App\Http\Resources\BlogResource;
use App\Http\Resources\StoryResource;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicTagController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $tags = Tag::query()
            ->where('is_active', true)
            ->withCount([
                'stories' => fn ($query) => $query->published(),
                'blogs' => fn ($query) => $query->published(),
            ])
            ->orderBy('name')
            ->get();

        return TagResource::collection($tags);
    }

    public function show(Tag $tag): TagResource
    {
        abort_unless($tag->is_active, 404);

        return new TagResource($tag->loadCount([
            'stories' => fn ($query) => $query->published(),
            'blogs' => fn ($query) => $query->published(),
        ]));
    }

    public function stories(ContentIndexRequest $request, Tag $tag): AnonymousResourceCollection
    {
        abort_unless($tag->is_active, 404);
        $stories = $tag->stories()
            ->published()
            ->with(['author', 'legalCategory', 'featuredImage', 'tags'])
            ->latest('published_at')
            ->paginate($request->integer('per_page', 20));

        return StoryResource::collection($stories);
    }

    public function blogs(ContentIndexRequest $request, Tag $tag): AnonymousResourceCollection
    {
        abort_unless($tag->is_active, 404);
        $blogs = $tag->blogs()
            ->published()
            ->with(['author', 'legalCategory', 'featuredImage', 'tags'])
            ->latest('published_at')
            ->paginate($request->integer('per_page', 20));

        return BlogResource::collection($blogs);
    }
}
