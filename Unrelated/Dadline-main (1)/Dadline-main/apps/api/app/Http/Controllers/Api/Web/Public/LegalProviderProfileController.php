<?php

namespace App\Http\Controllers\Api\Web\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StoryResource;
use App\Http\Resources\VendorServiceResource;
use App\Models\User;
use Illuminate\Http\Request;

class LegalProviderProfileController extends Controller
{
    public function show(Request $request, string $type, string $slug)
    {
        $provider = User::query()
            ->legalProviders()
            ->with([
                'vendorProfile',
                'vendorServices',
                'profile.city.province',
                'profile.avatar',
                'legalCategories',
            ])
            ->whereHas('vendorProfile', function ($q) use ($type, $slug) {
                $q->where('vendor_type', $type)
                    ->where('slug', $slug);
            })
            ->firstOrFail();

        $blogs = $provider->blogs()
            ->published()
            ->with(['author', 'legalCategory', 'featuredImage', 'tags'])
            ->withCount(['comments' => fn ($query) => $query->approved()])
            ->latest('published_at')
            ->latest('id')
            ->limit(5)
            ->get();

        $stories = $provider->stories()
            ->published()
            ->with(['author', 'legalCategory', 'featuredImage', 'tags'])
            ->withCount(['comments' => fn ($query) => $query->approved()])
            ->latest('published_at')
            ->latest('id')
            ->limit(5)
            ->get();

        $documents = $provider->products()
            ->published()
            ->with([
                'vendor:id,first_name,last_name,role',
                'vendor.vendorProfile:user_id,slug,vendor_type',
                'vendor.profile:user_id,avatar_id',
                'vendor.profile.avatar:id,storage_key',
                'legalCategory:id,name,slug',
            ])
            ->latest('published_at')
            ->latest('id')
            ->limit(5)
            ->get();

        return response()->json([

            'id' => $provider->id,
            'name' => $provider->full_name,
            'role' => $provider->role->label(),
            'online' => $provider->isOnline(),
            'lastActive' => optional($provider->lastSeen())?->diffForHumans(),
            'slug' => $provider->vendorProfile?->slug,
            'profile' => $provider->vendorProfile?->profile,
            'recomended' => false,
            'tagLine' => $provider->vendorProfile?->profile('tagline'),
            'avatar' => $provider->profile?->avatar?->getUrl(),
            'introVideoUrl' => $provider->vendorProfile?->profile('video_url'),
            'license' => $provider->vendorProfile?->license,
            'location' => [
                'city' => $provider->profile?->city?->name,
                'citySlug' => $provider->profile?->city?->slug,
                'province' => $provider->profile?->city?->province?->name,
                'provinceSlug' => $provider->profile?->city?->province?->slug,
            ],

            'services' => VendorServiceResource::collection(
                $provider->vendorServices
                    ->where('enabled', true)
                    ->sortBy('sort')
                    ->values()
            ),

            'categories' => $provider->legalCategories->map(fn ($item) => [
                'name' => $item->name,
                'slug' => $item->slug,
            ]),

            'blogs' => BlogResource::collection($blogs)->resolve($request),
            'stories' => StoryResource::collection($stories)->resolve($request),
            'documents' => ProductResource::collection($documents)->resolve($request),
            'products' => ProductResource::collection($documents)->resolve($request),
            'reviews' => [],
        ]);
    }
}
