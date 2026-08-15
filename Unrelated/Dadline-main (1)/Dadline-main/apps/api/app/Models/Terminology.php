<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Terminology extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'terminology';

    protected $fillable = [
        'id',
        'title',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}
