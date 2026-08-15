<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LawTitle extends Model
{
    public const CREATED_AT = null;

    protected $fillable = [
        'id',
        'category_id',
        'title',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(LawCategory::class, 'category_id');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(LawSection::class, 'title_id');
    }
}
