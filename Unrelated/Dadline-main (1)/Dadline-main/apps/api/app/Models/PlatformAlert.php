<?php

namespace App\Models;

use App\Enums\PlatformAlertStatus;
use Illuminate\Database\Eloquent\Model;

class PlatformAlert extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'message',
        'target_role',
        'alert_type',
        'button_text',
        'link',
        'tab',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => PlatformAlertStatus::class,
            'expires_at' => 'datetime',
        ];
    }
}
