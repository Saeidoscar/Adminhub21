<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePackageRequest;
use App\Http\Requests\UpdatePackageRequest;
use App\Models\AdminProfile;
use App\Models\Package;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PackageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Package::query()
            ->join('admin_profiles', 'packages.admin_id', '=', 'admin_profiles.id')
            ->join('users', 'admin_profiles.user_id', '=', 'users.id')
            ->select(
                'packages.*',
                'packages.admin_id as adminId',
                'users.name_en as adminNameEn',
                'users.name_fa as adminNameFa',
                'admin_profiles.photo as adminPhoto'
            );

        if ($request->filled('platforms')) {
            $platforms = explode(',', $request->query('platforms'));
            $query->where(function ($q) use ($platforms) {
                foreach ($platforms as $platform) {
                    $q->orWhereJsonContains('packages.platforms', $platform);
                }
            });
        }

        if ($request->filled('type')) {
            $query->where('packages.type', $request->query('type'));
        }

        if ($request->filled('featured')) {
            $query->where('packages.featured', filter_var($request->query('featured'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('billingCycle')) {
            $query->where('packages.billing_cycle', $request->query('billingCycle'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('packages.name', 'ilike', "%{$search}%")
                  ->orWhere('packages.description', 'ilike', "%{$search}%");
            });
        }

        $packages = $query
            ->orderByDesc('packages.featured')
            ->orderByDesc('packages.created_at')
            ->get()
            ->map(fn ($pkg) => $this->formatPackage($pkg));

        return response()->json(['packages' => $packages]);
    }

    public function show(string $id): JsonResponse
    {
        $pkg = Package::query()
            ->join('admin_profiles', 'packages.admin_id', '=', 'admin_profiles.id')
            ->join('users', 'admin_profiles.user_id', '=', 'users.id')
            ->where('packages.id', $id)
            ->select(
                'packages.*',
                'packages.admin_id as adminId',
                'users.name_en as adminNameEn',
                'users.name_fa as adminNameFa',
                'admin_profiles.photo as adminPhoto'
            )
            ->first();

        if (!$pkg) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        return response()->json(['package' => $this->formatPackage($pkg)]);
    }

    public function store(StorePackageRequest $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $profile = AdminProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $data = $request->validated();
        $data['admin_id'] = $profile->id;

        $pkg = Package::create($data);

        $admin = User::join('admin_profiles', 'users.id', '=', 'admin_profiles.user_id')
            ->where('admin_profiles.id', $profile->id)
            ->select('users.name_en', 'users.name_fa', 'admin_profiles.photo')
            ->first();

        return response()->json([
            'package' => $this->formatPackage((object) [
                'id' => $pkg->id,
                'adminId' => $profile->id,
                'adminNameEn' => $admin->name_en ?? '',
                'adminNameFa' => $admin->name_fa ?? '',
                'adminPhoto' => $admin->photo ?? '',
                'name' => $pkg->name,
                'description' => $pkg->description,
                'type' => $pkg->type,
                'platforms' => $pkg->platforms ?? [],
                'platformConfigs' => $pkg->platform_configs ?? [],
                'priceToman' => (int) $pkg->price_toman,
                'priceUSD' => (int) $pkg->price_usd,
                'billingCycle' => $pkg->billing_cycle,
                'deliveryTime' => $pkg->delivery_time,
                'featured' => (bool) $pkg->featured,
                'active' => (bool) $pkg->active,
                'createdAt' => $pkg->created_at?->toISOString(),
                'updatedAt' => $pkg->updated_at?->toISOString(),
            ]),
        ], 201);
    }

    public function update(UpdatePackageRequest $request, string $id): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $pkg = Package::find($id);

        if (!$pkg) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        $data = $request->validated();
        $pkg->update($data);

        $admin = User::join('admin_profiles', 'users.id', '=', 'admin_profiles.user_id')
            ->where('admin_profiles.id', $pkg->admin_id)
            ->select('users.name_en', 'users.name_fa', 'admin_profiles.photo')
            ->first();

        return response()->json([
            'package' => $this->formatPackage((object) [
                'id' => $pkg->id,
                'adminId' => $pkg->admin_id,
                'adminNameEn' => $admin->name_en ?? '',
                'adminNameFa' => $admin->name_fa ?? '',
                'adminPhoto' => $admin->photo ?? '',
                'name' => $pkg->name,
                'description' => $pkg->description,
                'type' => $pkg->type,
                'platforms' => $pkg->platforms ?? [],
                'platformConfigs' => $pkg->platform_configs ?? [],
                'priceToman' => (int) $pkg->price_toman,
                'priceUSD' => (int) $pkg->price_usd,
                'billingCycle' => $pkg->billing_cycle,
                'deliveryTime' => $pkg->delivery_time,
                'featured' => (bool) $pkg->featured,
                'active' => (bool) $pkg->active,
                'createdAt' => $pkg->created_at?->toISOString(),
                'updatedAt' => $pkg->updated_at?->toISOString(),
            ]),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $pkg = Package::find($id);

        if (!$pkg) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        $pkg->delete();

        return response()->json(['ok' => true]);
    }

    private function formatPackage($pkg): array
    {
        return [
            'id' => (string) $pkg->id,
            'adminId' => (string) $pkg->adminId,
            'adminNameEn' => $pkg->adminNameEn ?? '',
            'adminNameFa' => $pkg->adminNameFa ?? '',
            'adminPhoto' => $pkg->adminPhoto ?? '',
            'name' => $pkg->name,
            'description' => $pkg->description,
            'type' => $pkg->type,
            'platforms' => $pkg->platforms ?? [],
            'platformConfigs' => $pkg->platform_configs ?? [],
            'priceToman' => (int) $pkg->price_toman,
            'priceUSD' => (int) $pkg->price_usd,
            'billingCycle' => $pkg->billing_cycle,
            'deliveryTime' => $pkg->delivery_time,
            'featured' => (bool) $pkg->featured,
            'active' => (bool) $pkg->active,
            'createdAt' => $pkg->created_at?->toISOString(),
            'updatedAt' => $pkg->updated_at?->toISOString(),
        ];
    }
}
