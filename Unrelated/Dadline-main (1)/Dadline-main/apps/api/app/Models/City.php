<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'id',
        'parent_id',
        'name',
        'slug',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(City::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(City::class, 'parent_id');
    }

    public function userProfiles(): HasMany
    {
        return $this->hasMany(
            UserProfile::class
        );
    }

    public function province(): BelongsTo
{
    return $this->belongsTo(
        City::class,
        'parent_id'
    );
}
}
