<?php

namespace App\Models;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'channel',
        'category',
        'enabled',
    ];

    protected function casts(): array
    {
        return [
            'channel' => NotificationChannel::class,
            'category' => NotificationCategory::class,
            'enabled' => 'boolean',
        ];
    }
}
