<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Content\PublishStoryAction;
use App\Actions\Content\UnpublishStoryAction;
use App\Actions\Content\PublishBlogAction;
use App\Actions\Content\ModerateCommentAction;
use App\Actions\Content\ManageTagsAction;
use App\Actions\Reactions\ReactToContentAction;
use App\Services\Content\ContentService;
use App\Services\Notifications\NotificationService;
use App\Enums\NotificationCategory;
use App\Models\Story;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function __construct(
        private readonly ContentService $contentService,
        private readonly NotificationService $notificationService,
    ) {}

    public function stories(Request $request): JsonResponse
    {
        $stories = Story::query()
            ->where('user_id', $request->user()->id)
            ->paginate();

        return response()->json($stories);
    }

    public function showStory($id): JsonResponse
    {
        $story = Story::query()->findOrFail($id);

        return response()->json($story);
    }

    public function storeStory(Request $request): JsonResponse
    {
        $story = Story::query()->create($request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'media' => ['nullable', 'array'],
            'tags' => ['nullable', 'array'],
        ]) + ['user_id' => $request->user()->id]);

        return response()->json($story, 201);
    }

    public function publishStory(Story $story): JsonResponse
    {
        $story = $this->contentService->publishStory($story);

        return response()->json($story);
    }

    public function unpublishStory(Story $story): JsonResponse
    {
        $story = $this->contentService->unpublishStory($story);

        return response()->json($story);
    }

    public function blogs(Request $request): JsonResponse
    {
        $blogs = Blog::query()
            ->where('user_id', $request->user()->id)
            ->paginate();

        return response()->json($blogs);
    }

    public function showBlog($slug): JsonResponse
    {
        $blog = Blog::query()->where('slug', $slug)->firstOrFail();

        return response()->json($blog);
    }

    public function storeBlog(Request $request): JsonResponse
    {
        $blog = Blog::query()->create($request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'media' => ['nullable', 'array'],
            'tags' => ['nullable', 'array'],
        ]) + ['user_id' => $request->user()->id]);

        return response()->json($blog, 201);
    }

    public function publishBlog(Blog $blog): JsonResponse
    {
        $blog = $this->contentService->publishBlog($blog);

        return response()->json($blog);
    }

    public function storeComment(Request $request): JsonResponse
    {
        $comment = \App\Models\Comment::query()->create($request->validate([
            'commentable_id' => ['required', 'integer'],
            'commentable_type' => ['required', 'string'],
            'content' => ['required', 'string'],
            'media' => ['nullable', 'array'],
        ]) + ['user_id' => $request->user()->id]);

        return response()->json($comment, 201);
    }

    public function updateComment(Request $request, Comment $comment): JsonResponse
    {
        $comment->update($request->validate([
            'content' => ['nullable', 'string'],
            'media' => ['nullable', 'array'],
        ]));

        return response()->json($comment);
    }

    public function deleteComment(Comment $comment): JsonResponse
    {
        $comment->delete();

        return response()->json(null, 204);
    }

    public function moderateComment(Comment $comment): JsonResponse
    {
        $request = request();
        $comment = $this->contentService->moderateComment($comment, $request->boolean('approved'));

        return response()->json($comment);
    }

    public function tags(Request $request): JsonResponse
    {
        $tags = Tag::query()->get();

        return response()->json($tags);
    }
}
