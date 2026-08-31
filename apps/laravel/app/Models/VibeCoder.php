<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VibeCoder extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name_en',
        'name_fa',
        'photo',
        'stack',
        'rating',
        'reviews',
        'projects',
        'rate_toman',
        'rate_usd',
        'delivery',
        'bio_en',
        'bio_fa',
        'active',
    ];

    protected $casts = [
        'rating' => 'float',
        'reviews' => 'integer',
        'projects' => 'integer',
        'rate_toman' => 'integer',
        'rate_usd' => 'integer',
        'active' => 'boolean',
    ];
}
