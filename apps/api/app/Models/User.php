<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Hidden([
    'password',
    'remember_token',
])]

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'is_verified',
        'is_banned',
        'wallet_balance',
        'avatar',
        'bio',
        'timezone',
        'locale',
    ];

    protected $appends = [
        'role_label',
    ];

    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'is_verified' => 'boolean',
            'is_banned' => 'boolean',
            'wallet_balance' => 'decimal:2',
            'email_verified_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function profile(): HasOne
    {
        return $this->hasOne(AdminProfile::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function affiliate(): HasOne
    {
        return $this->hasOne(Affiliate::class);
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }

    public function contractsAsEmployer(): HasMany
    {
        return $this->hasMany(Contract::class, 'user_id');
    }

    public function contractsAsAdmin(): HasMany
    {
        return $this->hasMany(Contract::class, 'client_id');
    }

    public function offersSent(): HasMany
    {
        return $this->hasMany(Offer::class, 'user_id');
    }

    public function offersReceived(): HasMany
    {
        return $this->hasMany(Offer::class, 'target_user_id');
    }

    public function reviewsWritten(): HasMany
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'target_user_id');
    }

    public function portfolios(): HasMany
    {
        return $this->hasMany(Portfolio::class);
    }

    public function portfolioItems(): HasMany
    {
        return $this->hasMany(PortfolioItem::class);
    }

    public function ticketsSent(): HasMany
    {
        return $this->hasMany(Ticket::class, 'user_id');
    }

    public function ticketsAssigned(): HasMany
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }

    public function ticketMessages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    public function blogs(): HasMany
    {
        return $this->hasMany(Blog::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function aiConversations(): HasMany
    {
        return $this->hasMany(AiConversation::class);
    }

    public function ownedOffices(): HasMany
    {
        return $this->hasMany(Office::class, 'owner_id');
    }

    public function officeMemberships(): HasMany
    {
        return $this->hasMany(OfficeMember::class);
    }

    public function officeContacts(): HasMany
    {
        return $this->hasMany(OfficeContact::class);
    }

    public function officeCaseNotes(): HasMany
    {
        return $this->hasMany(OfficeCaseNote::class);
    }

    public function officeCaseActions(): HasMany
    {
        return $this->hasMany(OfficeCaseAction::class);
    }

    public function officeTimeLogs(): HasMany
    {
        return $this->hasMany(OfficeTimeLog::class);
    }

    public function assignedOfficeCaseTasks(): HasMany
    {
        return $this->hasMany(OfficeCaseTask::class, 'assignee_id');
    }

    public function uploadedOfficeAttachments(): HasMany
    {
        return $this->hasMany(OfficeAttachment::class, 'user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    public function ticketDepartments(): BelongsToMany
    {
        return $this->belongsToMany(TicketDepartment::class, 'ticket_department_user');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeAdmins(Builder $query): Builder
    {
        return $query->whereIn('role', [
            UserRole::Admin->value,
            UserRole::SuperAdmin->value,
        ]);
    }

    public function scopeEmployers(Builder $query): Builder
    {
        return $query->where('role', UserRole::Employer->value);
    }

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('is_verified', true);
    }

    public function scopeBanned(Builder $query): Builder
    {
        return $query->where('is_banned', true);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getRoleLabelAttribute(): string
    {
        return $this->role->label();
    }

    public function getNameEnAttribute(): ?string
    {
        return $this->name;
    }

    public function getNameFaAttribute(): ?string
    {
        return null;
    }

    public function getPhoneVerifiedAttribute(): bool
    {
        return $this->is_verified;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isAdmin(): bool
    {
        return $this->role->isAdmin();
    }

    public function isSuperAdmin(): bool
    {
        return $this->role->isSuperAdmin();
    }

    public function isEmployer(): bool
    {
        return $this->role->isEmployer();
    }

    public function hasRole(string $role): bool
    {
        return $this->role?->value === $role;
    }
}
