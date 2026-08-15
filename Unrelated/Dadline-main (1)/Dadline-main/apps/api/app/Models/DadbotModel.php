<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DadbotModel extends Model
{
    protected $fillable = [
        'provider',
        'code',
        'name',
        'group',
        'in_usd',
        'cache_usd',
        'out_usd',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'in_usd' => 'decimal:4',
            'cache_usd' => 'decimal:4',
            'out_usd' => 'decimal:4',
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(DodbotConversation::class, 'model_id');
    }
}
