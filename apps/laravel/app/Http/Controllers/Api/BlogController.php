<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Models\Blog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Blog::query()
            ->join('users', 'blogs.author_id', '=', 'users.id')
            ->select(
                'blogs.*',
                DB::raw("COALESCE(users.name_fa, users.name_en) as authorName")
            );

        if ($request->filled('status')) {
            $query->where('blogs.status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('blogs.title', 'ilike', "%{$search}%")
                  ->orWhere('blogs.content', 'ilike', "%{$search}%");
            });
        }

        $blogs = $query
            ->orderByDesc('blogs.created_at')
            ->get()
            ->map(fn ($blog) => $this->formatBlog($blog));

        return response()->json(['blogs' => $blogs]);
    }

    public function show(string $id): JsonResponse
    {
        $blog = Blog::query()
            ->join('users', 'blogs.author_id', '=', 'users.id')
            ->where('blogs.id', $id)
            ->select(
                'blogs.*',
                DB::raw("COALESCE(users.name_fa, users.name_en) as authorName")
            )
            ->first();

        if (!$blog) {
            return response()->json(['message' => 'Blog not found'], 404);
        }

        return response()->json(['blog' => $this->formatBlog($blog)]);
    }

    public function store(StoreBlogRequest $request): JsonResponse
    {
        $user = Auth::user();
        $data = $request->validated();

        $blog = Blog::create([
            'author_id' => $user->id,
            'title' => $data['title'],
            'content' => $data['content'],
            'cover_url' => $data['coverUrl'] ?? null,
            'status' => $data['status'] ?? 'draft',
        ]);

        $authorName = $user->name_fa ?: $user->name_en;

        return response()->json([
            'blog' => $this->formatBlog((object) [
                'id' => $blog->id,
                'authorId' => $user->id,
                'authorName' => $authorName,
                'title' => $blog->title,
                'content' => $blog->content,
                'coverUrl' => $blog->cover_url ?? '',
                'status' => $blog->status,
                'views' => $blog->views ?? 0,
                'publishedAt' => $blog->published_at ?? '',
                'createdAt' => $blog->created_at?->toISOString(),
                'updatedAt' => $blog->updated_at?->toISOString(),
            ]),
        ], 201);
    }

    public function update(UpdateBlogRequest $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $blog = Blog::find($id);

        if (!$blog) {
            return response()->json(['message' => 'Blog not found'], 404);
        }

        if ($blog->author_id !== $user->id) {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $data = $request->validated();
        $blog->update($data);

        $authorName = $user->name_fa ?: $user->name_en;

        return response()->json([
            'blog' => $this->formatBlog((object) [
                'id' => $blog->id,
                'authorId' => $blog->author_id,
                'authorName' => $authorName,
                'title' => $blog->title,
                'content' => $blog->content,
                'coverUrl' => $blog->cover_url ?? '',
                'status' => $blog->status,
                'views' => $blog->views ?? 0,
                'publishedAt' => $blog->published_at ?? '',
                'createdAt' => $blog->created_at?->toISOString(),
                'updatedAt' => $blog->updated_at?->toISOString(),
            ]),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        $blog = Blog::find($id);

        if (!$blog) {
            return response()->json(['message' => 'Blog not found'], 404);
        }

        if ($blog->author_id !== $user->id) {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $blog->delete();

        return response()->json(['ok' => true]);
    }

    private function formatBlog($blog): array
    {
        return [
            'id' => (string) $blog->id,
            'authorId' => (string) $blog->author_id,
            'authorName' => $blog->authorName ?? 'Unknown',
            'title' => $blog->title,
            'content' => $blog->content,
            'coverUrl' => $blog->cover_url ?? '',
            'status' => $blog->status,
            'views' => (int) ($blog->views ?? 0),
            'publishedAt' => $blog->published_at ?? '',
            'createdAt' => $blog->created_at?->toISOString(),
            'updatedAt' => $blog->updated_at?->toISOString(),
        ];
    }
}
