<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageAttachment extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'message_id',
        'attachment_id',
        'sort_order',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'message_id' => 'integer',
            'attachment_id' => 'integer',
            'sort_order' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function attachment(): BelongsTo
    {
        return $this->belongsTo(Attachment::class);
    }
}
