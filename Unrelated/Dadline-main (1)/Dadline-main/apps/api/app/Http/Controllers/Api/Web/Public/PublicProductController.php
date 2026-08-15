<?php

namespace App\Http\Controllers\Api\Web\Public;

use App\Actions\Marketplace\GetPublicProductAction;
use App\Actions\Marketplace\ListPublicProductsAction;
use App\Actions\TrackPublicViewAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Marketplace\ProductIndexRequest;
use App\Http\Requests\TrackPublicViewRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class PublicProductController extends Controller
{
    public function index(
        ProductIndexRequest $request,
        ListPublicProductsAction $action
    ): AnonymousResourceCollection {
        $result = $action->execute($request->validated());

        return ProductResource::collection($result['products'])
            ->additional(['filters' => $result['filters']]);
    }

    public function show(
        Product $product,
        GetPublicProductAction $action
    ): ProductResource {
        return new ProductResource($action->execute($product));
    }

    public function trackView(
        TrackPublicViewRequest $request,
        Product $product,
        TrackPublicViewAction $action
    ): Response {
        $action->execute($product, $request->viewerKey());

        return response()->noContent();
    }
}
