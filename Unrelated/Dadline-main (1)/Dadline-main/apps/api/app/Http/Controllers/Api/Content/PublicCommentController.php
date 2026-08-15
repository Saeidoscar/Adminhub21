<?php

namespace App\Http\Controllers\Api\Content;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Blog;
use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicCommentController extends Controller
{
    public function forStory(Request $request, Story $story): AnonymousResourceCollection
    {
        Story::query()->published()->whereKey($story->getKey())->firstOrFail();

        return $this->collection($request, $story->comments());
    }

    public function forBlog(Request $request, Blog $blog): AnonymousResourceCollection
    {
        Blog::query()->published()->whereKey($blog->getKey())->firstOrFail();

        return $this->collection($request, $blog->comments());
    }

    private function collection(Request $request, $query): AnonymousResourceCollection
    {
        $comments = $query
            ->approved()
            ->whereNull('parent_id')
            ->with(['user', 'approvedReplies.user', 'approvedReplies.approvedReplies.user'])
            ->oldest('created_at')
            ->paginate(min(max($request->integer('per_page', 20), 1), 100));

        return CommentResource::collection($comments);
    }
}
