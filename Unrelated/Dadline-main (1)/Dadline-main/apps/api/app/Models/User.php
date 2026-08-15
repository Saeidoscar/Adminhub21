<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Enums\VendorType;
use App\Services\OnlineUserService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
        'id',
        'mobile',
        'email',
        'password',

        'first_name',
        'last_name',

        'role',
        'is_vendor',

        'registered_at',
        'last_login_at',
    ];

    protected $appends = [
        'full_name',
        'role_label',
    ];

    protected function casts(): array
    {
        return [
            'role' => UserRole::class,

            'registered_at' => 'datetime',
            'last_login_at' => 'datetime',

            'is_vendor' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function verification(): HasOne
    {
        return $this->hasOne(UserVerification::class);
    }

    public function notificationPreference(): HasOne
    {
        return $this->hasOne(NotificationPreference::class);
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

    public function purchaseIntents(): HasMany
    {
        return $this->hasMany(PurchaseIntent::class);
    }

    public function dodbotBalance(): HasOne
    {
        return $this->hasOne(DodbotBalance::class);
    }

    public function dodbotConversations(): HasMany
    {
        return $this->hasMany(DodbotConversation::class);
    }

    public function dodbotPurchases(): HasMany
    {
        return $this->hasMany(DodbotPurchase::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function giftCards(): HasMany
    {
        return $this->hasMany(GiftCard::class);
    }

    public function redeemedGiftCards(): BelongsToMany
    {
        return $this->belongsToMany(GiftCard::class, 'gift_card_redemptions')
            ->withPivot('redeemed_at');
    }

    public function ticketsSent(): HasMany
    {
        return $this->hasMany(Ticket::class, 'sender_id');
    }

    public function ticketsAssigned(): HasMany
    {
        return $this->hasMany(Ticket::class, 'assigned_to_id');
    }

    public function ticketsAsProvider(): HasMany
    {
        return $this->hasMany(Ticket::class, 'provider_id');
    }

    public function ticketDepartments(): BelongsToMany
    {
        return $this->belongsToMany(TicketDepartment::class, 'ticket_department_user')
            ->withPivot('created_at');
    }

    public function ticketMessages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    public function botLink(): HasOne
    {
        return $this->hasOne(BotLink::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(UserSubscription::class);
    }

    public function vendorProfile(): HasOne
    {
        return $this->hasOne(VendorProfile::class);
    }

    public function vendorServices(): HasMany
    {
        return $this->hasMany(VendorService::class);
    }

    public function vendorApplications(): HasMany
    {
        return $this->hasMany(VendorApplication::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
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

    public function recordedOfficeTransactions(): HasMany
    {
        return $this->hasMany(OfficeTransaction::class, 'recorded_by');
    }

    public function uploadedOfficeAttachments(): HasMany
    {
        return $this->hasMany(OfficeAttachment::class, 'uploaded_by');
    }

    public function reviewsWritten(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'vendor_id');
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    public function blogs(): HasMany
    {
        return $this->hasMany(Blog::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    public function questionAnswers(): HasMany
    {
        return $this->hasMany(QuestionAnswer::class, 'vendor_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'vendor_id');
    }

    public function ordersAsBuyer(): HasMany
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function ordersAsVendor(): HasMany
    {
        return $this->hasMany(Order::class, 'vendor_id');
    }

    public function consultationSubscriptionsAsClient(): HasMany
    {
        return $this->hasMany(ConsultationSubscription::class, 'client_id');
    }

    public function consultationSubscriptionsAsVendor(): HasMany
    {
        return $this->hasMany(ConsultationSubscription::class, 'vendor_id');
    }

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class, 'requester_id');
    }

    public function serviceOffers(): HasMany
    {
        return $this->hasMany(ServiceOffer::class, 'vendor_id');
    }

    public function serviceResults(): HasMany
    {
        return $this->hasMany(ServiceResult::class, 'vendor_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function phoneConsultations(): HasMany
    {
        return $this->hasMany(PhoneConsultation::class);
    }

    public function vendorPhoneConsultations(): HasMany
    {
        return $this->hasMany(PhoneConsultation::class, 'vendor_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function legalCategories(): BelongsToMany
    {
        return $this->belongsToMany(
            LegalCategory::class,
            'user_legal_categories'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeLegalProviders(Builder $query): Builder
    {
        return $query->whereIn('role', [
            UserRole::LAWYER_BONYAD,
            UserRole::LAWYER_JUDICIAL,
            UserRole::LAWYER_TRAINEE,

            UserRole::OFFICIAL_EXPERT,
            UserRole::LEGAL_EXPERT,
            UserRole::SENIOR_LEGAL_EXPERT,
            UserRole::LEGAL_DOCTORATE,
        ]);
    }

    public function scopeVendorType(Builder $query, VendorType $type): Builder
    {
        return $query->whereHas(
            'vendorProfile',
            fn ($q) => $q->where('vendor_type', $type)
        );
    }

    public function scopeLawyers(Builder $query): Builder
    {
        return $query->whereIn('role', [
            UserRole::LAWYER_BONYAD,
            UserRole::LAWYER_JUDICIAL,
            UserRole::LAWYER_TRAINEE,
        ]);
    }

    public function scopeExperts(Builder $query): Builder
    {
        return $query->whereIn('role', [
            UserRole::OFFICIAL_EXPERT,
            UserRole::LEGAL_EXPERT,
            UserRole::SENIOR_LEGAL_EXPERT,
            UserRole::LEGAL_DOCTORATE,
        ]);
    }

    public function scopeJudges(Builder $query): Builder
    {
        return $query->where('role', UserRole::JUDGE);
    }

    public function scopeAdmins(Builder $query): Builder
    {
        return $query->whereIn('role', [
            UserRole::ADMIN,
            UserRole::MANAGER,
            UserRole::EDITOR,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    public function getRoleLabelAttribute(): string
    {
        return $this->role->label();
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

    public function hasRole(array $roles): bool
    {
        return in_array($this->role->value, $roles, true);
    }

    public function isLawyer(): bool
    {
        return $this->role->isLawyer();
    }

    public function isExpert(): bool
    {
        return $this->role->isExpert();
    }

    public function isJudge(): bool
    {
        return $this->role->isJudge();
    }

    public function isLegalProvider(): bool
    {
        return $this->isLawyer() || $this->isExpert();
    }

    public function isOnline(): bool
    {
        return app(OnlineUserService::class)
            ->isOnline($this);
    }

    public function lastSeen(): ?Carbon
    {
        return app(OnlineUserService::class)
            ->lastSeen($this);
    }
}
