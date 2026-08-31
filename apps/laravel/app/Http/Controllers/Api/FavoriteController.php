<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminProfile;
use App\Models\Favorite;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $favorites = Favorite::where('user_id', $user->id)
            ->join('admin_profiles', 'favorites.admin_id', '=', 'admin_profiles.id')
            ->join('users', 'admin_profiles.user_id', '=', 'users.id')
            ->select(
                'favorites.admin_id as adminId',
                'users.name_en as adminNameEn',
                'users.name_fa as adminNameFa',
                'admin_profiles.photo as adminPhoto',
                'admin_profiles.rating as adminRating',
                'admin_profiles.reviews as adminReviews',
                'admin_profiles.verified as adminVerified',
                'admin_profiles.insured as adminInsured',
                'admin_profiles.platforms as platforms',
                'favorites.created_at as createdAt'
            )
            ->orderByDesc('favorites.created_at')
            ->get()
            ->map(fn ($fav) => [
                'adminId' => (string) $fav->adminId,
                'adminNameEn' => $fav->adminNameEn ?? '',
                'adminNameFa' => $fav->adminNameFa ?? '',
                'adminPhoto' => $fav->adminPhoto ?? '',
                'adminRating' => (float) $fav->adminRating,
                'adminReviews' => (int) $fav->adminReviews,
                'adminVerified' => (bool) $fav->adminVerified,
                'adminInsured' => (bool) $fav->adminInsured,
                'platforms' => $fav->platforms ?? [],
                'createdAt' => $fav->createdAt,
            ]);

        return response()->json(['favorites' => $favorites]);
    }

    public function store(string $adminId): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'employer') {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $existing = Favorite::where('user_id', $user->id)
            ->where('admin_id', $adminId)
            ->join('admin_profiles', 'favorites.admin_id', '=', 'admin_profiles.id')
            ->join('users', 'admin_profiles.user_id', '=', 'users.id')
            ->select(
                'favorites.admin_id as adminId',
                'users.name_en as adminNameEn',
                'users.name_fa as adminNameFa',
                'admin_profiles.photo as adminPhoto',
                'admin_profiles.rating as adminRating',
                'admin_profiles.reviews as adminReviews',
                'admin_profiles.verified as adminVerified',
                'admin_profiles.insured as adminInsured',
                'admin_profiles.platforms as platforms',
                'favorites.created_at as createdAt'
            )
            ->first();

        if ($existing) {
            return response()->json(['favorite' => [
                'adminId' => (string) $existing->adminId,
                'adminNameEn' => $existing->adminNameEn ?? '',
                'adminNameFa' => $existing->adminNameFa ?? '',
                'adminPhoto' => $existing->adminPhoto ?? '',
                'adminRating' => (float) $existing->adminRating,
                'adminReviews' => (int) $existing->adminReviews,
                'adminVerified' => (bool) $existing->adminVerified,
                'adminInsured' => (bool) $existing->adminInsured,
                'platforms' => $existing->platforms ?? [],
                'createdAt' => $existing->createdAt,
            ]], 201);
        }

        $favorite = Favorite::create([
            'user_id' => $user->id,
            'admin_id' => $adminId,
        ]);

        $admin = User::join('admin_profiles', 'users.id', '=', 'admin_profiles.user_id')
            ->where('admin_profiles.id', $adminId)
            ->select('users.name_en', 'users.name_fa', 'admin_profiles.photo', 'admin_profiles.rating', 'admin_profiles.reviews', 'admin_profiles.verified', 'admin_profiles.insured', 'admin_profiles.platforms')
            ->first();

        return response()->json(['favorite' => [
            'adminId' => $adminId,
            'adminNameEn' => $admin->name_en ?? '',
            'adminNameFa' => $admin->name_fa ?? '',
            'adminPhoto' => $admin->photo ?? '',
            'adminRating' => (float) ($admin->rating ?? 0),
            'adminReviews' => (int) ($admin->reviews ?? 0),
            'adminVerified' => (bool) ($admin->verified ?? false),
            'adminInsured' => (bool) ($admin->insured ?? false),
            'platforms' => $admin->platforms ?? [],
            'createdAt' => $favorite->created_at?->toISOString(),
        ]], 201);
    }

    public function destroy(string $adminId): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'employer') {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        Favorite::where('user_id', $user->id)
            ->where('admin_id', $adminId)
            ->delete();

        return response()->json(['ok' => true]);
    }
}
