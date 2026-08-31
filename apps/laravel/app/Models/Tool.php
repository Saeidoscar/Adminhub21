<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'category',
        'icon',
        'rating',
        'reviews',
        'popular',
        'price_toman',
        'price_usd',
        'desc_en',
        'desc_fa',
        'active',
    ];

    protected $casts = [
        'rating' => 'float',
        'reviews' => 'integer',
        'popular' => 'boolean',
        'price_toman' => 'integer',
        'price_usd' => 'integer',
        'active' => 'boolean',
    ];
}
