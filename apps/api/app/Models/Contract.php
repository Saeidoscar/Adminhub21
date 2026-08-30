<?php

namespace App\Models;

use App\Enums\ContractStatus;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contract extends Model
{
    use SoftDeletes;

    protected $attributes = [
        'status' => ContractStatus::Draft->value,
    ];

    protected $fillable = [
        'user_id',
        'client_id',
        'package_id',
        'title',
        'description',
        'amount',
        'currency',
        'status',
        'step_data',
        'insurance_amount',
        'substitute_provider',
        'milestones',
        'signatures',
        'pdf_path',
        'signed_at',
        'clauses_accepted_at',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'step_data' => 'array',
            'insurance_amount' => 'decimal:2',
            'milestones' => 'array',
            'signatures' => 'array',
            'signed_at' => 'datetime',
            'clauses_accepted_at' => 'datetime',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
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

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function clauses(): HasMany
    {
        return $this->hasMany(ContractClause::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', ContractStatus::Active->value);
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', ContractStatus::Draft->value);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', ContractStatus::Completed->value);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isPending(): bool
    {
        return $this->status === ContractStatus::Pending->value;
    }

    public function isDraft(): bool
    {
        return $this->status === ContractStatus::Draft->value;
    }

    public function isActive(): bool
    {
        return $this->status === ContractStatus::Active->value;
    }

    public function isCompleted(): bool
    {
        return $this->status === ContractStatus::Completed->value;
    }

    public function isCancelled(): bool
    {
        return $this->status === ContractStatus::Cancelled->value;
    }

    public function statusLabel(): string
    {
        return ContractStatus::labelFor($this->status);
    }
}
