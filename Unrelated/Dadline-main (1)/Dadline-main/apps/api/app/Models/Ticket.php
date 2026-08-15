<?php

namespace App\Models;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use SoftDeletes;

    public ?int $notificationActorId = null;

    /** @var array<string, mixed> */
    public array $notificationPrevious = [];

    protected $fillable = [
        'id',
        'uuid',
        'sender_id',
        'department_id',
        'title',
        'assigned_to_id',
        'provider_id',
        'status',
        'priority',
        'last_message_at',
        'last_user_read_at',
        'last_staff_read_at',
        'last_provider_read_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => TicketStatus::class,
            'priority' => TicketPriority::class,
            'last_message_at' => 'datetime',
            'last_user_read_at' => 'datetime',
            'last_staff_read_at' => 'datetime',
            'last_provider_read_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(TicketDepartment::class, 'department_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_id');
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(TicketMessage::class)->latestOfMany();
    }

    public function latestPublicMessage(): HasOne
    {
        return $this->hasOne(TicketMessage::class)
            ->where('is_internal', false)
            ->latestOfMany();
    }

    public function markReadBy(User $user): void
    {
        $column = match (true) {
            $user->role === UserRole::ADMIN => 'last_staff_read_at',
            (int) $this->provider_id === (int) $user->id => 'last_provider_read_at',
            default => 'last_user_read_at',
        };

        $this->forceFill([$column => now()])->saveQuietly();
    }

    public function hasUnreadFor(?User $user): bool
    {
        if ($user === null || $this->last_message_at === null) {
            return false;
        }

        $readAt = match (true) {
            $user->role === UserRole::ADMIN => $this->last_staff_read_at,
            (int) $this->provider_id === (int) $user->id => $this->last_provider_read_at,
            default => $this->last_user_read_at,
        };

        return $readAt === null || $this->last_message_at->isAfter($readAt);
    }
}
