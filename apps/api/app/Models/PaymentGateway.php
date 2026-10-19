<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * A payment gateway row from `payment_gateways`.
 *
 * Both PaymentController and PaymentGatewayService referenced this class before
 * it existed, so every call to /payments or to availableGateways() died with
 * "Class not found".
 */
class PaymentGateway extends Model
{
    protected $fillable = [
        'code',
        'name',
        'provider',
        'config',
        'is_active',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
