<?php

namespace App\Models;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Notification extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'template_key',
        'event_key',
        'channel',
        'recipient',
        'title',
        'body',
        'payload',
        'category',
        'priority',
        'is_critical',
        'dedupe_key',
        'metadata',
        'status',
        'sent_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'channel' => NotificationChannel::class,
            'payload' => 'array',
            'category' => NotificationCategory::class,
            'priority' => NotificationPriority::class,
            'is_critical' => 'boolean',
            'metadata' => 'array',
            'status' => NotificationStatus::class,
            'sent_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(NotificationDelivery::class);
    }
}
