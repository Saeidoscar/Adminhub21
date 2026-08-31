<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    protected $fillable = [
        'admin_id',
        'name',
        'description',
        'type',
        'platforms',
        'platform_configs',
        'price_toman',
        'price_usd',
        'billing_cycle',
        'delivery_time',
        'featured',
        'active',
    ];

    protected $casts = [
        'platforms' => 'array',
        'platform_configs' => 'array',
        'featured' => 'boolean',
        'active' => 'boolean',
        'price_toman' => 'integer',
        'price_usd' => 'integer',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminProfile::class, 'admin_id');
    }

    public function customOffers(): HasMany
    {
        return $this->hasMany(CustomOffer::class, 'package_id');
    }
}
