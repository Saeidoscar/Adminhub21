<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Editor extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name_en',
        'name_fa',
        'photo',
        'specialty',
        'rating',
        'reviews',
        'projects',
        'delivery',
        'rate_toman',
        'rate_usd',
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
