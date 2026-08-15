<?php

namespace App\Models;

use App\Enums\QuestionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'uuid',
        'user_id',
        'title',
        'body',
        'category_id',
        'is_private',
        'slug',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
            'status' => QuestionStatus::class,
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function legalCategory(): BelongsTo
    {
        return $this->belongsTo(LegalCategory::class, 'category_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuestionAnswer::class);
    }
}
