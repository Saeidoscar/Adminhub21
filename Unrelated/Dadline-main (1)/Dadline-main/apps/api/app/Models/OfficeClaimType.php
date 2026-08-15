<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OfficeClaimType extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'id',
        'parent_id',
        'category',
        'name',
        'is_leaf',
    ];

    protected function casts(): array
    {
        return [
            'parent_id' => 'integer',
            'is_leaf' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(OfficeClaimType::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(OfficeClaimType::class, 'parent_id');
    }

    public function cases(): HasMany
    {
        return $this->hasMany(OfficeCase::class, 'claim_type_id');
    }

    public function scopeLeaf(Builder $query): Builder
    {
        return $query->where('is_leaf', true);
    }
}
