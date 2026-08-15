<?php

namespace App\Models;

use App\Enums\ProductType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $attributes = [
        'discount' => 0,
    ];

    protected $fillable = [
        'order_id',
        'product_id',
        'product_version_id',
        'vendor_id',
        'product_title',
        'product_type',
        'unit_price',
        'discount',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'product_type' => ProductType::class,
            'unit_price' => 'integer',
            'discount' => 'integer',
            'total_price' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productVersion(): BelongsTo
    {
        return $this->belongsTo(ProductVersion::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }
}
