<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Editor extends Model
{
    use HasFactory;

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

    protected function casts(): array
    {
        return [
            'rating' => 'float',
            'reviews' => 'integer',
            'projects' => 'integer',
            'rate_toman' => 'integer',
            'rate_usd' => 'integer',
            'active' => 'boolean',
        ];
    }
}
