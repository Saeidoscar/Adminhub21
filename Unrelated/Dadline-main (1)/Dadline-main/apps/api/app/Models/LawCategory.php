<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LawCategory extends Model
{
    public const CREATED_AT = null;

    protected $fillable = [
        'id',
        'version_id',
        'name',
    ];

    public function version(): BelongsTo
    {
        return $this->belongsTo(LawVersion::class, 'version_id');
    }

    public function titles(): HasMany
    {
        return $this->hasMany(LawTitle::class, 'category_id');
    }
}
