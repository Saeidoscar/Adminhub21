<?php

namespace App\Http\Controllers\Api;

use App\Actions\Options\GetPublicPricingAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PublicPricingController extends Controller
{
    public function __invoke(GetPublicPricingAction $action): JsonResponse
    {
        return response()->json([
            'data' => $action->execute(),
        ]);
    }
}
