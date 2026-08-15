<?php

namespace App\Models;

use App\Enums\MessageType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    public const UPDATED_AT = null;

    protected $attributes = [
        'type' => MessageType::User->value,
    ];

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'type',
        'body',
        'dadcoin',
        'read_at',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'conversation_id' => 'integer',
            'sender_id' => 'integer',
            'type' => MessageType::class,
            'dadcoin' => 'integer',
            'read_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function attachmentRecords(): HasMany
    {
        return $this->hasMany(MessageAttachment::class);
    }

    public function attachments(): BelongsToMany
    {
        return $this->belongsToMany(Attachment::class, 'message_attachments')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }
}
