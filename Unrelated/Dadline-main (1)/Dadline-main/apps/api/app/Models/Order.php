<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $attributes = [
        'discount' => 0,
        'vat' => 0,
        'commission' => 0,
        'vendor_share' => 0,
        'status' => OrderStatus::Pending->value,
    ];

    protected $fillable = [
        'buyer_id',
        'vendor_id',
        'subtotal',
        'discount',
        'vat',
        'total_price',
        'commission',
        'vendor_share',
        'status',
        'paid_at',
        'canceled_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'discount' => 'integer',
            'vat' => 'integer',
            'total_price' => 'integer',
            'commission' => 'integer',
            'vendor_share' => 'integer',
            'status' => OrderStatus::class,
            'paid_at' => 'datetime',
            'canceled_at' => 'datetime',
        ];
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
