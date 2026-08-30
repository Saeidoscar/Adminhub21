<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Story;
use App\Models\Blog;
use App\Models\Comment;
use App\Enums\ContentStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContentController extends Controller
{
    public function stories(Request $request): JsonResponse
    {
        $query = Story::query()->with('user');

        if ($search = $request->string('search')->toString()) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        $stories = $query->paginate();

        return response()->json(['stories' => $stories->items()], 200, ['X-Total-Count' => $stories->total()]);
    }

    public function moderateStory(Story $story, Request $request): JsonResponse
    {
        $this->authorize('moderate', $story);

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:approve,reject,archive'],
        ]);

        $action = $validated['action'];

        match ($action) {
            'approve' => $story->update(['status' => ContentStatus::Published->value]),
            'reject' => $story->update(['status' => ContentStatus::Rejected->value]),
            'archive' => $story->update(['status' => ContentStatus::Archived->value]),
        };

        $story->refresh();

        return response()->json(['story' => $story]);
    }

    public function blogs(Request $request): JsonResponse
    {
        $query = Blog::query()->with('user');

        if ($search = $request->string('search')->toString()) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        $blogs = $query->paginate();

        return response()->json(['blogs' => $blogs->items()], 200, ['X-Total-Count' => $blogs->total()]);
    }

    public function moderateBlog(Blog $blog, Request $request): JsonResponse
    {
        $this->authorize('moderate', $blog);

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:approve,reject,archive'],
        ]);

        $action = $validated['action'];

        match ($action) {
            'approve' => $blog->update(['status' => ContentStatus::Published->value]),
            'reject' => $blog->update(['status' => ContentStatus::Rejected->value]),
            'archive' => $blog->update(['status' => ContentStatus::Archived->value]),
        };

        $blog->refresh();

        return response()->json(['blog' => $blog]);
    }

    public function comments(Request $request): JsonResponse
    {
        $query = Comment::query()->with('user');

        if ($postType = $request->string('postType')->toString()) {
            $query->where('commentable_type', $postType);
        }

        $comments = $query->paginate();

        return response()->json(['comments' => $comments->items()], 200, ['X-Total-Count' => $comments->total()]);
    }

    public function deleteComment(Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $comment->forceDelete();

        return response()->json(null, 204);
    }
}
