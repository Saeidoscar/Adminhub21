<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

use App\Models\Favorite;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = Favorite::query()
            ->where('user_id', $request->user()->id)
            ->with('admin')
            ->get()
            ->map(fn (Favorite $favorite) => [
                'id' => (string) $favorite->id,
                'userId' => (string) $favorite->user_id,
                'adminId' => (string) $favorite->admin_id,
                'createdAt' => $favorite->created_at?->toISOString() ?? now()->toISOString(),
            ]);

        return response()->json(['favorites' => $favorites]);
    }

    public function store(Request $request, string $adminId): JsonResponse
    {
        $request->validate([
            'adminId' => ['required', 'integer', 'exists:users,id'],
        ]);

        $favorite = Favorite::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'admin_id' => $adminId,
        ]);

        return response()->json([
            'favorite' => [
                'id' => (string) $favorite->id,
                'userId' => (string) $favorite->user_id,
                'adminId' => (string) $favorite->admin_id,
                'createdAt' => $favorite->created_at?->toISOString() ?? now()->toISOString(),
            ],
        ], 201);
    }

    public function destroy(Request $request, string $adminId): JsonResponse
    {
        $favorite = Favorite::query()
            ->where('user_id', $request->user()->id)
            ->where('admin_id', $adminId)
            ->firstOrFail();

        $favorite->delete();

        return response()->json(null, 204);
    }
}


