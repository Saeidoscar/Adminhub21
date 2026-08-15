<?php

namespace App\Models;

use App\Casts\PgVector;
use App\Enums\EmbeddingSourceType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Embedding extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'source_type',
        'source_id',
        'embedding',
        'created_at',
    ];

    protected $hidden = [
        'embedding',
    ];

    protected function casts(): array
    {
        return [
            'source_type' => EmbeddingSourceType::class,
            'source_id' => 'string',
            'embedding' => PgVector::class,
            'created_at' => 'datetime',
        ];
    }

    public function scopeForSource(Builder $query, EmbeddingSourceType $sourceType, string|int $sourceId): Builder
    {
        return $query
            ->where('source_type', $sourceType->value)
            ->where('source_id', (string) $sourceId);
    }

    public function lawArticle(): BelongsTo
    {
        return $this->belongsTo(LawArticle::class, 'source_id');
    }

    public function documentProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'source_id');
    }

    public function terminology(): BelongsTo
    {
        return $this->belongsTo(Terminology::class, 'source_id');
    }
}
