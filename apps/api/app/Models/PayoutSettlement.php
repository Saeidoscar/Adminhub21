<?php

namespace App\Models;

use App\Enums\PayoutSettlementStatus;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class PayoutSettlement extends Model
{
    protected $attributes = [
        'fee' => 0,
        'status' => PayoutSettlementStatus::Pending->value,
    ];

    protected $fillable = [
        'transaction_id',
        'amount',
        'fee',
        'total_payable',
        'iban',
        'provider',
        'unique_code',
        'receipt_link',
        'track_id',
        'crypto_address',
        'provider_data',
        'failure_reason',
        'scheduled_for',
        'submitted_at',
        'last_checked_at',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'transaction_id' => 'integer',
            'amount' => 'integer',
            'fee' => 'integer',
            'total_payable' => 'integer',
            'status' => PayoutSettlementStatus::class,
            'provider_data' => 'array',
            'scheduled_for' => 'datetime',
            'submitted_at' => 'datetime',
            'last_checked_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'transaction_id');
    }

    public function user(): HasOneThrough
    {
        return $this->hasOneThrough(
            User::class,
            WalletTransaction::class,
            'id',
            'id',
            'transaction_id',
            'user_id',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', PayoutSettlementStatus::Pending->value);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', PayoutSettlementStatus::Completed->value);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isPending(): bool
    {
        return $this->status === PayoutSettlementStatus::Pending->value;
    }

    public function isCompleted(): bool
    {
        return $this->status === PayoutSettlementStatus::Completed->value;
    }

    public function isFailed(): bool
    {
        return $this->status === PayoutSettlementStatus::Failed->value;
    }
}
