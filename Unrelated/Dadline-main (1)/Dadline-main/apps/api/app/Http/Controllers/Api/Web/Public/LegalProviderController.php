<?php

namespace App\Http\Controllers\Api\Web\Public;

use App\Enums\VendorService as VendorServiceType;
use App\Enums\VendorType;
use App\Http\Controllers\Controller;
use App\Http\Resources\LegalProviderResource;
use App\Models\User;
use App\Services\OnlineUserService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LegalProviderController extends Controller
{
    public function index(
        Request $request,
        OnlineUserService $onlineUsers
    ) {
        $validated = $request->validate([
            'type' => ['nullable', Rule::enum(VendorType::class)],
            'service' => ['nullable', Rule::enum(VendorServiceType::class)],
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:191'],
            'province' => ['nullable', 'string', 'max:191'],
            'city' => ['nullable', 'string', 'max:191'],
            'online' => ['nullable', Rule::in(['true', 'false', '1', '0'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'between:1,24'],
        ]);

        $service = $validated['service'] ?? null;
        $relations = [
            'vendorProfile',
            'profile.avatar',
            'profile.city.province',
            'legalCategories',
        ];

        if ($service) {
            $relations['vendorServices'] = fn ($query) => $query
                ->service($service)
                ->enabled()
                ->orderBy('sort');
        }

        $providers = User::query()

            // فقط ارائه‌دهندگان خدمات حقوقی
            ->legalProviders()

            // نوع ارائه‌دهنده
            // lawyer | expert
            ->when($validated['type'] ?? null, function ($query, $type) {

                $query->whereHas(
                    'vendorProfile',
                    fn ($q) => $q->where('vendor_type', $type)
                );

            })

            ->when($service, function ($query, $service) {
                $query
                    ->whereHas('vendorProfile', fn ($q) => $q->active())
                    ->whereHas(
                        'vendorServices',
                        fn ($q) => $q->service($service)->enabled()
                    );
            })

            // تخصص
            // family
            // criminal
            ->when($validated['category'] ?? null, function ($query, $category) {

                $query->whereHas(
                    'legalCategories',
                    function ($q) use ($category) {
                        $q->where('slug', $category);
                    }
                );
            })

            // استان
            ->when($validated['province'] ?? null, function ($query, $provinceSlug) {

                $query->whereHas(
                    'profile.city.province',
                    function ($q) use ($provinceSlug) {
                        $q->where('slug', $provinceSlug);
                    }
                );
            })

            // شهر
            ->when($validated['city'] ?? null, function ($query, $citySlug) {

                $query->whereHas(
                    'profile.city',
                    function ($q) use ($citySlug) {
                        $q->where('slug', $citySlug);
                    }
                );
            })

            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where(
                        'first_name',
                        'ILIKE',
                        "%{$search}%"
                    )
                        ->orWhere(
                            'last_name',
                            'ILIKE',
                            "%{$search}%"
                        );
                });
            })

            ->with($relations)
            ->withAvg([
                'reviewsReceived as approved_reviews_avg_rate' => fn ($query) => $query
                    ->where('status', 'approved'),
            ], 'rate')
            ->withCount([
                'reviewsReceived as approved_reviews_count' => fn ($query) => $query
                    ->where('status', 'approved'),
            ])
            ->orderByRaw('last_login_at DESC NULLS LAST')
            ->when(
                $request->boolean('online'),
                function ($query) use ($onlineUsers) {
                    $ids = $onlineUsers->onlineIds();
                    if (empty($ids)) {
                        $query->whereRaw('1 = 0');

                        return;
                    }
                    $query->whereIn('id', $ids);
                }
            )

            ->paginate(
                $validated['per_page'] ?? 20
            );

        return LegalProviderResource::collection($providers);
    }
}
