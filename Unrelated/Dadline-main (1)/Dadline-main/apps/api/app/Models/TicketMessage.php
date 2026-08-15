<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketMessage extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'ticket_id',
        'user_id',
        'from_admin',
        'is_internal',
        'body',
        'file_id',
    ];

    protected function casts(): array
    {
        return [
            'from_admin' => 'boolean',
            'is_internal' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attachment(): BelongsTo
    {
        return $this->belongsTo(Attachment::class, 'file_id');
    }
}
