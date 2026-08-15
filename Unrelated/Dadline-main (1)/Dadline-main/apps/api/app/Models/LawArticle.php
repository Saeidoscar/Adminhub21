<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LawArticle extends Model
{
    public const CREATED_AT = null;

    protected $fillable = [
        'id',
        'section_id',
        'content',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(LawSection::class, 'section_id');
    }
}
