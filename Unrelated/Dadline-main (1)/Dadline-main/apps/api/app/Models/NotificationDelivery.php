<?php

namespace App\Models;

use App\Enums\NotificationChannel;
use App\Enums\NotificationDeliveryStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationDelivery extends Model
{
    protected $fillable = [
        'notification_id',
        'user_id',
        'channel',
        'recipient',
        'provider',
        'provider_message_id',
        'title',
        'body',
        'payload',
        'provider_payload',
        'status',
        'attempts',
        'max_attempts',
        'sms_units',
        'error_code',
        'error_message',
        'next_retry_at',
        'sent_at',
        'failed_at',
    ];

    protected function casts(): array
    {
        return [
            'channel' => NotificationChannel::class,
            'payload' => 'array',
            'provider_payload' => 'array',
            'status' => NotificationDeliveryStatus::class,
            'attempts' => 'integer',
            'max_attempts' => 'integer',
            'sms_units' => 'integer',
            'next_retry_at' => 'datetime',
            'sent_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function notification(): BelongsTo
    {
        return $this->belongsTo(Notification::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
