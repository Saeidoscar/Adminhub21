<?php

namespace App\Models;

use App\Contracts\PubliclyViewable;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model implements PubliclyViewable
{
    use SoftDeletes;

    protected $attributes = [
        'sales_count' => 0,
        'views_count' => 0,
        'status' => ProductStatus::Draft->value,
    ];

    protected $fillable = [
        'vendor_id',
        'category_id',
        'title',
        'slug',
        'product_type',
        'description',
        'price',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'product_type' => ProductType::class,
            'status' => ProductStatus::class,
            'price' => 'integer',
            'sales_count' => 'integer',
            'views_count' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', ProductStatus::Published)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function viewCacheNamespace(): string
    {
        return 'products';
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function legalCategory(): BelongsTo
    {
        return $this->belongsTo(LegalCategory::class, 'category_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ProductVersion::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
