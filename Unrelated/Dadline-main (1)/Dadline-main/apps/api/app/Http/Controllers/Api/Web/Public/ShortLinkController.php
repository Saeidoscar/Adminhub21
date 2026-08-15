<?php

namespace App\Http\Controllers\Api\Web\Public;

use App\Actions\ShortLinks\ResolveShortLinkAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ShortLinkController extends Controller
{
    public function __invoke(
        string $shortCode,
        ResolveShortLinkAction $action
    ): JsonResponse {
        return response()->json([
            'data' => [
                'original_url' => $action->execute($shortCode),
            ],
        ]);
    }
}
