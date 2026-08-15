<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BotLink extends Model
{
    public const UPDATED_AT = null;

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'telegram_id',
        'eitaa_id',
        'bale_id',
        'auth_token',
        'fcm_token',
    ];

    protected function casts(): array
    {
        return [
            'telegram_id' => 'integer',
            'eitaa_id' => 'integer',
            'bale_id' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
