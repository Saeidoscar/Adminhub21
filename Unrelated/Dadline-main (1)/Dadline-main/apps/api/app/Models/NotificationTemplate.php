<?php

namespace App\Models;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    protected $fillable = [
        'key',
        'channel',
        'title',
        'body',
        'variables',
        'provider_patterns',
        'category',
        'priority',
        'is_critical',
        'is_active',
        'quiet_hours_enabled',
        'dedupe_window_minutes',
        'retention_days',
    ];

    protected function casts(): array
    {
        return [
            'channel' => NotificationChannel::class,
            'variables' => 'array',
            'provider_patterns' => 'array',
            'category' => NotificationCategory::class,
            'priority' => NotificationPriority::class,
            'is_critical' => 'boolean',
            'is_active' => 'boolean',
            'quiet_hours_enabled' => 'boolean',
            'dedupe_window_minutes' => 'integer',
            'retention_days' => 'integer',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
