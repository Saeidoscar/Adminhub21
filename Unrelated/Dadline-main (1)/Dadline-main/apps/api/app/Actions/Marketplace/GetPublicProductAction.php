<?php

namespace App\Actions\Marketplace;

use App\Models\Product;

class GetPublicProductAction
{
    public function execute(Product $product): Product
    {
        return Product::query()
            ->published()
            ->whereKey($product->getKey())
            ->with([
                'vendor:id,first_name,last_name,role',
                'vendor.vendorProfile:user_id,slug,vendor_type',
                'vendor.profile:user_id,avatar_id',
                'vendor.profile.avatar:id,storage_key',
                'legalCategory:id,name,slug',
            ])
            ->firstOrFail();
    }
}
