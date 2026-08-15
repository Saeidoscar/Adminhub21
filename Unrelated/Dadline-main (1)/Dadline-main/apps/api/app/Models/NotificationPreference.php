<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'sms_enabled',
        'bot_enabled',
        'push_enabled',
        'email_enabled',
        'eitaa_enabled',
        'bale_enabled',
        'channel_preferences',
        'quiet_hours_start',
        'quiet_hours_end',
        'timezone',
        'sms_balance',
    ];

    protected function casts(): array
    {
        return [
            'sms_enabled' => 'boolean',
            'bot_enabled' => 'boolean',
            'push_enabled' => 'boolean',
            'email_enabled' => 'boolean',
            'eitaa_enabled' => 'boolean',
            'bale_enabled' => 'boolean',
            'channel_preferences' => 'array',
            'sms_balance' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
