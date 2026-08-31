<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $postId = $request->query('postId');
        $postType = $request->query('postType');

        if (!$postId || !$postType) {
            return response()->json(['message' => 'postId and postType are required'], 422);
        }

        $query = Comment::query()
            ->join('users', 'comments.author_id', '=', 'users.id')
            ->where('comments.post_id', $postId)
            ->where('comments.post_type', $postType)
            ->select(
                'comments.*',
                DB::raw("COALESCE(users.name_fa, users.name_en) as authorName")
            );

        $comments = $query
            ->orderBy('comments.created_at')
            ->get()
            ->map(fn ($comment) => $this->formatComment($comment));

        return response()->json(['comments' => $comments]);
    }

    public function show(string $id): JsonResponse
    {
        $comment = Comment::query()
            ->join('users', 'comments.author_id', '=', 'users.id')
            ->where('comments.id', $id)
            ->select(
                'comments.*',
                DB::raw("COALESCE(users.name_fa, users.name_en) as authorName")
            )
            ->first();

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        return response()->json(['comment' => $this->formatComment($comment)]);
    }

    public function store(StoreCommentRequest $request): JsonResponse
    {
        $user = Auth::user();
        $data = $request->validated();

        $comment = Comment::create([
            'post_id' => $data['postId'],
            'post_type' => $data['postType'],
            'author_id' => $user->id,
            'parent_id' => $data['parentId'] ?? null,
            'body' => $data['body'],
        ]);

        $authorName = $user->name_fa ?: $user->name_en;

        return response()->json([
            'comment' => $this->formatComment((object) [
                'id' => $comment->id,
                'postId' => $data['postId'],
                'postType' => $data['postType'],
                'authorId' => $user->id,
                'authorName' => $authorName,
                'parentId' => $comment->parent_id ?? '',
                'body' => $comment->body,
                'createdAt' => $comment->created_at?->toISOString(),
            ]),
        ], 201);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        if ($comment->author_id !== $user->id) {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $comment->delete();

        return response()->json(['ok' => true]);
    }

    private function formatComment($comment): array
    {
        return [
            'id' => (string) $comment->id,
            'postId' => (string) $comment->post_id,
            'postType' => $comment->post_type,
            'authorId' => (string) $comment->author_id,
            'authorName' => $comment->authorName ?? 'Unknown',
            'parentId' => $comment->parent_id ?? '',
            'body' => $comment->body,
            'createdAt' => $comment->created_at?->toISOString(),
        ];
    }
}
