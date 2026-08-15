<?php

namespace App\Http\Controllers\Api\Content;

use App\Actions\Content\ReactToContentAction;
use App\Enums\ReactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\ReactToContentRequest;
use App\Models\Blog;
use App\Models\Story;
use Illuminate\Http\JsonResponse;

class ContentReactionController extends Controller
{
    public function forStory(ReactToContentRequest $request, Story $story, ReactToContentAction $action): JsonResponse
    {
        Story::query()->published()->whereKey($story->getKey())->firstOrFail();

        return response()->json([
            'data' => $action->execute($story, $request->user(), ReactionType::from($request->validated('reaction'))),
        ]);
    }

    public function forBlog(ReactToContentRequest $request, Blog $blog, ReactToContentAction $action): JsonResponse
    {
        Blog::query()->published()->whereKey($blog->getKey())->firstOrFail();

        return response()->json([
            'data' => $action->execute($blog, $request->user(), ReactionType::from($request->validated('reaction'))),
        ]);
    }

    public function storyStatus(Story $story): JsonResponse
    {
        Story::query()->published()->whereKey($story->getKey())->firstOrFail();

        return $this->status($story);
    }

    public function blogStatus(Blog $blog): JsonResponse
    {
        Blog::query()->published()->whereKey($blog->getKey())->firstOrFail();

        return $this->status($blog);
    }

    private function status(Story|Blog $content): JsonResponse
    {
        $reaction = $content->reactions()
            ->where('user_id', request()->user()->getKey())
            ->value('type');

        return response()->json([
            'data' => [
                'reaction' => $reaction,
                'likesCount' => $content->likes_count,
                'dislikesCount' => $content->dislikes_count,
            ],
        ]);
    }
}
