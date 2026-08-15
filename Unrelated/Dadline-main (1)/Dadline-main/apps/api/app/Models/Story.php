<?php

namespace App\Models;

use App\Contracts\PubliclyViewable;
use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Story extends Model implements PubliclyViewable
{
    use SoftDeletes;

    protected $attributes = [
        'status' => ContentStatus::Draft->value,
        'views_count' => 0,
        'likes_count' => 0,
        'dislikes_count' => 0,
    ];

    protected $fillable = [
        'user_id',
        'category_id',
        'featured_image_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'status',
        'rejection_reason',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'views_count' => 'integer',
            'likes_count' => 'integer',
            'dislikes_count' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', ContentStatus::Published)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function viewCacheNamespace(): string
    {
        return 'stories';
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function legalCategory(): BelongsTo
    {
        return $this->belongsTo(LegalCategory::class, 'category_id');
    }

    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Attachment::class, 'featured_image_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function reactions(): MorphMany
    {
        return $this->morphMany(ContentReaction::class, 'reactionable');
    }
}
