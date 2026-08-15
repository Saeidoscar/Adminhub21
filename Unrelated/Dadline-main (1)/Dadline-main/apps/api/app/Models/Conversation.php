<?php

namespace App\Models;

use App\Enums\ConversationSubjectType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'uuid',
        'subject_type',
        'subject_id',
        'created_at',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'subject_type' => ConversationSubjectType::class,
            'subject_id' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class, 'subject_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(ConsultationSubscription::class, 'subject_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function unreadMessages(): HasMany
    {
        return $this->messages()->whereNull('read_at');
    }

    public function hasUnreadMessages(?int $exceptSenderId = null): bool
    {
        return $this->unreadMessages()
            ->when($exceptSenderId !== null, fn ($query) => $query->where('sender_id', '<>', $exceptSenderId))
            ->exists();
    }
}
