<?php

namespace App\Models;

use App\Enums\OfferStatus;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Offer extends Model
{
    use SoftDeletes;

    protected $attributes = [
        'status' => OfferStatus::Pending->value,
    ];

    protected $fillable = [
        'user_id',
        'target_user_id',
        'package_id',
        'message',
        'amount',
        'currency',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expires_at' => 'datetime',
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

    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', OfferStatus::Pending->value);
    }

    public function scopeAccepted(Builder $query): Builder
    {
        return $query->where('status', OfferStatus::Accepted->value);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isPending(): bool
    {
        return $this->status === OfferStatus::Pending->value;
    }

    public function isAccepted(): bool
    {
        return $this->status === OfferStatus::Accepted->value;
    }

    public function isRejected(): bool
    {
        return $this->status === OfferStatus::Rejected->value;
    }

    public function isExpired(): bool
    {
        return $this->status === OfferStatus::Expired->value
            || ($this->expires_at !== null && $this->expires_at->isPast());
    }

    public function statusLabel(): string
    {
        return OfferStatus::labelFor($this->status);
    }
}
