<?php

namespace App\Http\Controllers\Api\Web\Public;

use App\Actions\ShortLinks\CreateShortLinkAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\ShortLinks\CreateShortLinkRequest;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class CreateShortLinkController extends Controller
{
    public function __invoke(
        CreateShortLinkRequest $request,
        CreateShortLinkAction $action
    ): JsonResponse {
        $shortLink = $action->execute($request->originalUrl());

        return response()->json([
            'data' => [
                'short_code' => $shortLink->short_code,
            ],
        ], $shortLink->wasRecentlyCreated
            ? Response::HTTP_CREATED
            : Response::HTTP_OK);
    }
}
