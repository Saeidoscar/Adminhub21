<?php

namespace App\Http\Controllers\Api\Content;

use App\Enums\CommentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\ModerateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminCommentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'max:20'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $comments = Comment::query()
            ->with(['user', 'story', 'blog'])
            ->when($validated['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest('created_at')
            ->paginate($validated['per_page'] ?? 20)
            ->withQueryString();

        return CommentResource::collection($comments);
    }

    public function update(ModerateCommentRequest $request, Comment $comment): CommentResource
    {
        $comment->status = CommentStatus::from($request->validated('status'));
        $comment->save();

        return new CommentResource($comment->refresh()->load(['user', 'story', 'blog']));
    }

    public function destroy(Comment $comment): JsonResponse
    {
        $comment->delete();

        return response()->json(status: 204);
    }
}
