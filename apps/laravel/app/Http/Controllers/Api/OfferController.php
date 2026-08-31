<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOfferRequest;
use App\Models\AdminProfile;
use App\Models\CustomOffer;
use App\Models\Package;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OfferController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $offers = [];

        if ($user->role === 'employer') {
            $offers = CustomOffer::where('employer_id', $user->id)
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($offer) => $this->formatOffer($offer));
        } else {
            $profile = AdminProfile::where('user_id', $user->id)->first();

            if ($profile) {
                $offers = CustomOffer::where('admin_id', $profile->id)
                    ->orderByDesc('created_at')
                    ->get()
                    ->map(fn ($offer) => $this->formatOffer($offer));
            }
        }

        return response()->json(['offers' => $offers]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $offer = CustomOffer::find($id);

        if (!$offer) {
            return response()->json(['message' => 'Offer not found'], 404);
        }

        if ($user->role === 'employer' && $offer->employer_id !== $user->id) {
            return response()->json(['message' => 'Offer not found'], 404);
        }

        if ($user->role === 'admin') {
            $profile = AdminProfile::where('user_id', $user->id)->first();

            if (!$profile || $profile->id !== $offer->admin_id) {
                return response()->json(['message' => 'Offer not found'], 404);
            }
        }

        return response()->json(['offer' => $this->formatOffer($offer)]);
    }

    public function store(StoreOfferRequest $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'employer') {
            return response()->json(['message' => 'You do not have permission for this action', 'code' => 'FORBIDDEN'], 403);
        }

        $data = $request->validated();
        $employerName = $user->name_fa ?: $user->name_en;

        $adminId = $data['adminId'] ?? null;

        if (!$adminId && !empty($data['packageId'])) {
            $pkg = Package::find($data['packageId']);

            if (!$pkg) {
                return response()->json(['message' => 'Package not found'], 404);
            }

            $adminId = $pkg->admin_id;
        }

        if (!$adminId) {
            return response()->json(['message' => 'adminId or packageId is required'], 422);
        }

        $offer = CustomOffer::create([
            'admin_id' => $adminId,
            'employer_id' => $user->id,
            'employer_name' => $employerName,
            'name' => $data['name'],
            'description' => $data['description'],
            'platforms' => $data['platforms'],
            'platform_configs' => $data['platformConfigs'],
            'proposed_price_toman' => $data['proposedPriceToman'] ?? null,
            'proposed_price_usd' => $data['proposedPriceUSD'] ?? null,
            'billing_cycle' => $data['billingCycle'],
            'delivery_time' => $data['deliveryTime'] ?? null,
            'start_date' => $data['startDate'] ?? null,
            'end_date' => $data['endDate'] ?? null,
            'message' => $data['message'] ?? null,
        ]);

        return response()->json(['offer' => $this->formatOffer($offer)], 201);
    }

    private function formatOffer($offer): array
    {
        $admin = User::join('admin_profiles', 'users.id', '=', 'admin_profiles.user_id')
            ->where('admin_profiles.id', $offer->admin_id)
            ->select('users.name_en', 'users.name_fa', 'admin_profiles.photo')
            ->first();

        return [
            'id' => (string) $offer->id,
            'packageId' => $offer->package_id ? (string) $offer->package_id : null,
            'adminId' => (string) $offer->admin_id,
            'adminNameEn' => $admin->name_en ?? '',
            'adminNameFa' => $admin->name_fa ?? '',
            'adminPhoto' => $admin->photo ?? '',
            'employerId' => (string) $offer->employer_id,
            'employerName' => $offer->employer_name,
            'name' => $offer->name,
            'description' => $offer->description,
            'platforms' => $offer->platforms ?? [],
            'platformConfigs' => $offer->platform_configs ?? [],
            'proposedPriceToman' => $offer->proposed_price_toman !== null ? (int) $offer->proposed_price_toman : null,
            'proposedPriceUSD' => $offer->proposed_price_usd !== null ? (int) $offer->proposed_price_usd : null,
            'billingCycle' => $offer->billing_cycle,
            'deliveryTime' => $offer->delivery_time,
            'startDate' => $offer->start_date,
            'endDate' => $offer->end_date,
            'message' => $offer->message,
            'createdAt' => $offer->created_at?->toISOString(),
            'updatedAt' => $offer->updated_at?->toISOString(),
        ];
    }
}
