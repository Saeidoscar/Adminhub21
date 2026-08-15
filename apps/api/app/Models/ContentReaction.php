<?php

namespace App\Models;

use App\Enums\ReactionType;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContentReaction extends Model
{
    protected $fillable = [
        'user_id',
        'reactionable_type',
        'reactionable_id',
        'type',
    ];

    protected function casts(): array
    {
        return [
            'type' => ReactionType::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reactionable(): MorphTo
    {
        return $this->morphTo();
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isLike(): bool
    {
        return $this->type === ReactionType::Like->value;
    }

    public function isDislike(): bool
    {
        return $this->type === ReactionType::Dislike->value;
    }
}
