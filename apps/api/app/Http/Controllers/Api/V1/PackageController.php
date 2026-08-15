<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Packages\CreatePackageAction;
use App\Actions\Packages\UpdatePackageAction;
use App\Actions\Packages\TogglePackageStatusAction;
use App\Actions\Marketplace\SearchMarketplaceAction;
use App\Http\Requests\Api\V1\StorePackageRequest;
use App\Http\Requests\Api\V1\UpdatePackageRequest;
use App\Models\Package;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class PackageController extends Controller
{
    public function __construct(
        private readonly CreatePackageAction $createPackage,
        private readonly UpdatePackageAction $updatePackage,
        private readonly TogglePackageStatusAction $toggleStatus,
        private readonly SearchMarketplaceAction $searchMarketplace,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $packages = Package::query()
            ->where('user_id', $request->user()->id)
            ->with(['platformConfigs'])
            ->paginate();

        return response()->json($packages);
    }

    public function store(StorePackageRequest $request): JsonResponse
    {
        $package = $this->createPackage->execute($request->user(), $request->validated());

        return response()->json($package, 201);
    }

    public function show(Package $package): JsonResponse
    {
        $package->load(['user', 'platformConfigs']);

        return response()->json($package);
    }

    public function update(UpdatePackageRequest $request, Package $package): JsonResponse
    {
        $package = $this->updatePackage->execute($package, $request->validated());

        return response()->json($package);
    }

    public function destroy(Package $package): JsonResponse
    {
        $package->delete();

        return response()->json(null, 204);
    }

    public function publish(Package $package): JsonResponse
    {
        $package = $this->toggleStatus->execute($package, 'published');

        return response()->json($package);
    }

    public function unpublish(Package $package): JsonResponse
    {
        $package = $this->toggleStatus->execute($package, 'draft');

        return response()->json($package);
    }
}
