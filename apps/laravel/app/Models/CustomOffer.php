<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomOffer extends Model
{
    protected $fillable = [
        'package_id',
        'admin_id',
        'employer_id',
        'employer_name',
        'name',
        'description',
        'platforms',
        'platform_configs',
        'proposed_price_toman',
        'proposed_price_usd',
        'billing_cycle',
        'delivery_time',
        'start_date',
        'end_date',
        'message',
    ];

    protected $casts = [
        'platforms' => 'array',
        'platform_configs' => 'array',
        'proposed_price_toman' => 'integer',
        'proposed_price_usd' => 'integer',
    ];

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminProfile::class, 'admin_id');
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }
}
