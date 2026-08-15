<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LawSection extends Model
{
    public const CREATED_AT = null;

    protected $fillable = [
        'id',
        'title_id',
        'name',
    ];

    public function title(): BelongsTo
    {
        return $this->belongsTo(LawTitle::class, 'title_id');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(LawArticle::class, 'section_id');
    }
}
