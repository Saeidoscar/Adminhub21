<?php

namespace App\Models;

use App\Enums\CommentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasUuids;
    use SoftDeletes;

    protected $attributes = [
        'status' => CommentStatus::Pending->value,
        'likes_count' => 0,
        'dislikes_count' => 0,
    ];

    protected $fillable = [
        'story_id',
        'blog_id',
        'user_id',
        'parent_id',
        'content',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => CommentStatus::class,
            'likes_count' => 'integer',
            'dislikes_count' => 'integer',
        ];
    }

    public function uniqueIds(): array
    {
        return ['public_id'];
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', CommentStatus::Approved);
    }

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }

    public function blog(): BelongsTo
    {
        return $this->belongsTo(Blog::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function approvedReplies(): HasMany
    {
        return $this->replies()->approved()->oldest('created_at');
    }
}
