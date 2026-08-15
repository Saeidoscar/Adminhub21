<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageAttachment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'message_id',
        'storage_key',
        'original_name',
        'mime_type',
        'size_bytes',
        'created_at',
    ];

    protected $casts = [
        'message_id' => 'integer',
        'size_bytes' => 'integer',
        'created_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}
