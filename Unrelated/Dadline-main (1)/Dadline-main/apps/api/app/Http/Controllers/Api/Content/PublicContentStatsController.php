<?php

namespace App\Http\Controllers\Api\Content;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\Story;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PublicContentStatsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['story', 'blog'])],
        ]);

        $isStory = $validated['type'] === 'story';
        $model = $isStory ? Story::class : Blog::class;
        $foreignKey = $isStory ? 'story_id' : 'blog_id';
        $relation = $isStory ? 'stories' : 'blogs';

        $aggregate = $model::query()
            ->published()
            ->selectRaw('COUNT(*) AS contents_count')
            ->selectRaw('COALESCE(SUM(views_count), 0) AS views_count')
            ->selectRaw('COALESCE(SUM(likes_count), 0) AS likes_count')
            ->selectRaw('COALESCE(SUM(dislikes_count), 0) AS dislikes_count')
            ->first();

        $commentsCount = Comment::query()
            ->approved()
            ->whereNotNull($foreignKey)
            ->whereHas($isStory ? 'story' : 'blog', fn ($query) => $query->published())
            ->count();

        $tagsCount = Tag::query()
            ->where('is_active', true)
            ->whereHas($relation, fn ($query) => $query->published())
            ->count();

        return response()->json([
            'data' => [
                'contentsCount' => (int) $aggregate->contents_count,
                'viewsCount' => (int) $aggregate->views_count,
                'likesCount' => (int) $aggregate->likes_count,
                'dislikesCount' => (int) $aggregate->dislikes_count,
                'commentsCount' => $commentsCount,
                'tagsCount' => $tagsCount,
            ],
        ]);
    }
}
