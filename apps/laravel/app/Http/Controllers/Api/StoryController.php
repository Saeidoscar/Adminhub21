<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStoryRequest;
use App\Http\Requests\UpdateStoryRequest;
use App\Models\Story;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Story::query()
            ->join('users', 'stories.author_id', '=', 'users.id')
            ->select(
                'stories.*',
                DB::raw("COALESCE(users.name_fa, users.name_en) as authorName")
            );

        if ($request->filled('status')) {
            $query->where('stories.status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('stories.title', 'ilike', "%{$search}%")
                  ->orWhere('stories.content', 'ilike', "%{$search}%");
            });
        }

        $stories = $query
            ->orderByDesc('stories.created_at')
            ->get()
            ->map(fn ($story) => $this->formatStory($story));

        return response()->json(['stories' => $stories]);
    }

    public function show(string $id): JsonResponse
    {
        $story = Story::query()
            ->join('users', 'stories.author_id', '=', 'users.id')
            ->where('stories.id', $id)
            ->select(
                'stories.*',
                DB::raw("COALESCE(users.name_fa, users.name_en) as authorName")
            )
            ->first();

        if (!$story) {
            return response()->json(['message' => 'Story not found'], 404);
        }

        return response()->json(['story' => $this->formatStory($story)]);
    }

    public function store(StoreStoryRequest $request): JsonResponse
    {
        $user = Auth::user();
        $data = $request->validated();

        $story = Story::create([
            'author_id' => $user->id,
            'title' => $data['title'],
            'content' => $data['content'],
            'cover_url' => $data['coverUrl'] ?? null,
            'status' => $data['status'] ?? 'draft',
        ]);

        $authorName = $user->name_fa ?: $user->name_en;

        return response()->json([
            'story' => $this->formatStory((object) [
                'id' => $story->id,
                'authorId' => $user->id,
                'authorName' => $authorName,
                'title' => $story->title,
                'content' => $story->content,
                'coverUrl' => $story->cover_url ?? '',
                'status' => $story->status,
                'views' => $story->views ?? 0,
                'createdAt' => $story->created_at?->toISOString(),
                'updatedAt' => $story->updated_at?->toISOString(),
            ]),
        ], 201);
    }

    public function update(UpdateStoryRequest $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $story = Story::find($id);

        if (!$story) {
            return response()->json(['message' => 'Story not found'], 404);
        }

        if ($story->author_id !== $user->id) {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $data = $request->validated();
        $story->update($data);

        $authorName = $user->name_fa ?: $user->name_en;

        return response()->json([
            'story' => $this->formatStory((object) [
                'id' => $story->id,
                'authorId' => $story->author_id,
                'authorName' => $authorName,
                'title' => $story->title,
                'content' => $story->content,
                'coverUrl' => $story->cover_url ?? '',
                'status' => $story->status,
                'views' => $story->views ?? 0,
                'createdAt' => $story->created_at?->toISOString(),
                'updatedAt' => $story->updated_at?->toISOString(),
            ]),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        $story = Story::find($id);

        if (!$story) {
            return response()->json(['message' => 'Story not found'], 404);
        }

        if ($story->author_id !== $user->id) {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $story->delete();

        return response()->json(['ok' => true]);
    }

    private function formatStory($story): array
    {
        return [
            'id' => (string) $story->id,
            'authorId' => (string) $story->author_id,
            'authorName' => $story->authorName ?? 'Unknown',
            'title' => $story->title,
            'content' => $story->content,
            'coverUrl' => $story->cover_url ?? '',
            'status' => $story->status,
            'views' => (int) ($story->views ?? 0),
            'createdAt' => $story->created_at?->toISOString(),
            'updatedAt' => $story->updated_at?->toISOString(),
        ];
    }
}
