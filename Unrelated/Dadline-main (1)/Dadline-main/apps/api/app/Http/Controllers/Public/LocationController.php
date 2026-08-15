<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $hasProviders = $request->boolean('has_providers');

        $provinces = City::query()
            ->whereNull('parent_id')

            ->with([
                'children' => function ($query) use ($hasProviders) {

                    if ($hasProviders) {

                        $query->whereHas(
                            'userProfiles.user',
                            function ($q) {
                                $q->whereIn(
                                    'role',
                                    [
                                        'lawyer_bonyad',
                                        'lawyer_judicial',
                                        'lawyer_trainee',
                                        'official_expert',
                                        'legal_expert',
                                        'senior_legal_expert',
                                        'legal_doctorate',
                                    ]
                                );
                            }
                        );

                    }

                    $query->select([
                        'id',
                        'parent_id',
                        'name',
                        'slug',
                    ]);
                },
            ])

            ->select([
                'id',
                'name',
                'slug',
            ])

            ->get();

        if ($hasProviders) {

            $provinces = $provinces
                ->filter(
                    fn ($province) => $province->children->isNotEmpty()
                )
                ->values();

        }

        return response()->json($provinces);
    }
}
