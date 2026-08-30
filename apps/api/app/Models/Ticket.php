<?php

namespace App\Models;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'id',
        'user_id',
        'assigned_to',
        'subject',
        'description',
        'priority',
        'status',
        'attachments',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'priority' => TicketPriority::class,
            'status' => TicketStatus::class,
            'attachments' => 'array',
            'resolved_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    public function latestMessage(): HasMany
    {
        return $this->hasMany(TicketMessage::class)->latestOfMany();
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereIn('status', [
            TicketStatus::Open->value,
            TicketStatus::Answered->value,
            TicketStatus::Referred->value,
            TicketStatus::Pending->value,
        ]);
    }

    public function scopeClosed(Builder $query): Builder
    {
        return $query->where('status', TicketStatus::Closed->value);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isOpen(): bool
    {
        return $this->status !== TicketStatus::Closed->value;
    }

    public function isClosed(): bool
    {
        return $this->status === TicketStatus::Closed->value;
    }

    public function statusLabel(): string
    {
        return TicketStatus::labelFor($this->status);
    }

    public function priorityLabel(): string
    {
        return TicketPriority::labelFor($this->priority);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getUserNameAttribute(): ?string
    {
        return $this->user?->name;
    }

    public function getUserEmailAttribute(): ?string
    {
        return $this->user?->email;
    }

    public function getCategoryAttribute(): ?string
    {
        return null;
    }
}
