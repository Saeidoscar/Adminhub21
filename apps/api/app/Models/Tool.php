<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    use HasFactory;

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

    protected function casts(): array
    {
        return [
            'rating' => 'float',
            'reviews' => 'integer',
            'popular' => 'boolean',
            'price_toman' => 'integer',
            'price_usd' => 'integer',
            'active' => 'boolean',
        ];
    }
}
