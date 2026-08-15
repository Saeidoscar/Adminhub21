<?php

namespace App\Models;

use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class WalletTransaction extends Model
{
    protected $attributes = [
        'status' => WalletTransactionStatus::Pending->value,
        'payload' => '{}',
    ];

    protected $fillable = [
        'user_id',
        'amount',
        'direction',
        'type',
        'status',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'amount' => 'integer',
            'direction' => WalletTransactionDirection::class,
            'type' => WalletTransactionType::class,
            'status' => WalletTransactionStatus::class,
            'payload' => 'array',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'user_id', 'user_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(WalletTransactionPayment::class, 'transaction_id');
    }

    public function settlement(): HasOne
    {
        return $this->hasOne(PayoutSettlement::class, 'transaction_id');
    }

    public function sourceAffiliateCommission(): HasOne
    {
        return $this->hasOne(AffiliateCommission::class, 'source_tx_id');
    }

    public function paidAffiliateCommission(): HasOne
    {
        return $this->hasOne(AffiliateCommission::class, 'commission_tx_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeDeposits(Builder $query): Builder
    {
        return $query->where('direction', WalletTransactionDirection::Deposit->value);
    }

    public function scopeWithdrawals(Builder $query): Builder
    {
        return $query->where('direction', WalletTransactionDirection::Withdrawal->value);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', WalletTransactionStatus::Completed->value);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isDeposit(): bool
    {
        return $this->direction === WalletTransactionDirection::Deposit;
    }

    public function isWithdrawal(): bool
    {
        return $this->direction === WalletTransactionDirection::Withdrawal;
    }

    public function typeLabel(): string
    {
        $type = $this->type instanceof WalletTransactionType
            ? $this->type->value
            : $this->type;

        return WalletTransactionType::labelFor($type);
    }
}
