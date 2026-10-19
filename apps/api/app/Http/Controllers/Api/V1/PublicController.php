<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Marketplace\SearchMarketplaceAction;
use App\Http\Controllers\Controller;
use App\Models\AdminProfile;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function __construct(
        private readonly SearchMarketplaceAction $searchMarketplace,
    ) {}

    public function packages(Request $request): JsonResponse
    {
        $packages = Package::query()
            ->published()
            ->with(['user:id,name,avatar', 'platformConfigs'])
            ->paginate();

        return response()->json($packages);
    }

    /**
     * Resolve a published package by its slug, falling back to its id so old
     * links keep working while the public surface moves to slugs.
     */
    public function package(string $ref): JsonResponse
    {
        $package = Package::query()
            ->published()
            ->with(['user', 'platformConfigs'])
            ->when(
                ctype_digit($ref),
                fn ($query) => $query->whereKey($ref),
                fn ($query) => $query->where('slug', $ref),
            )
            ->firstOrFail();

        return response()->json($package);
    }

    public function profile($id): JsonResponse
    {
        $profile = AdminProfile::query()
            ->where('user_id', $id)
            ->with(['user', 'photo', 'insuranceDocument'])
            ->firstOrFail();

        return response()->json($profile);
    }

    public function search(Request $request): JsonResponse
    {
        $packages = $this->searchMarketplace->execute($request->all());

        return response()->json($packages);
    }

    public function categories(): JsonResponse
    {
        return response()->json([
            ['id' => 1, 'name' => 'Social Media', 'slug' => 'social-media'],
            ['id' => 2, 'name' => 'Content Creation', 'slug' => 'content-creation'],
            ['id' => 3, 'name' => 'SEO', 'slug' => 'seo'],
        ]);
    }
}
