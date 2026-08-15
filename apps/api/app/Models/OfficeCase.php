<?php

namespace App\Models;

use App\Enums\CaseStatus;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OfficeCase extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'office_id',
        'case_number',
        'archive_number',
        'title',
        'request_type_id',
        'claim_type_id',
        'authority_id',
        'case_branch',
        'city_id',
        'subscription_id',
        'status',
        'case_fee',
        'description',
        'progress',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'office_id' => 'integer',
            'request_type_id' => 'integer',
            'claim_type_id' => 'integer',
            'authority_id' => 'integer',
            'city_id' => 'integer',
            'subscription_id' => 'integer',
            'case_fee' => 'integer',
            'progress' => 'integer',
            'archived_at' => 'datetime',
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

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function requestType(): BelongsTo
    {
        return $this->belongsTo(OfficeRequestType::class, 'request_type_id');
    }

    public function claimType(): BelongsTo
    {
        return $this->belongsTo(OfficeClaimType::class, 'claim_type_id');
    }

    public function authority(): BelongsTo
    {
        return $this->belongsTo(OfficeReferralAuthority::class, 'authority_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(ConsultationSubscription::class, 'subscription_id');
    }

    public function parties(): HasMany
    {
        return $this->hasMany(OfficeCaseParty::class, 'case_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(OfficeCaseNote::class, 'case_id');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(OfficeCaseAction::class, 'case_id');
    }

    public function timeLogs(): HasMany
    {
        return $this->hasMany(OfficeTimeLog::class, 'case_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(OfficeCaseTask::class, 'case_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(OfficeCaseEvent::class, 'case_id');
    }

    public function aiAnalyses(): HasMany
    {
        return $this->hasMany(OfficeCaseAi::class, 'case_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(OfficeTransaction::class, 'case_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(OfficeAttachment::class, 'case_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeArchived(Builder $query): Builder
    {
        return $query->whereNotNull('archived_at');
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }

    public function scopeStatus(Builder $query, CaseStatus $status): Builder
    {
        return $query->where('status', $status->value);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isArchived(): bool
    {
        return $this->archived_at !== null;
    }

    public function isOpen(): bool
    {
        return $this->archived_at === null;
    }

    public function statusLabel(): string
    {
        return CaseStatus::labelFor($this->status);
    }
}
