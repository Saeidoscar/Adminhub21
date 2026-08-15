<?php

namespace App\Models;

use App\Enums\WalletStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $attributes = [
        'balance' => 0,
        'blocked_balance' => 0,
        'withdrawable_balance' => 0,
        'status' => WalletStatus::Active->value,
    ];

    protected $fillable = [
        'user_id',
        'balance',
        'blocked_balance',
        'withdrawable_balance',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'balance' => 'integer',
            'blocked_balance' => 'integer',
            'withdrawable_balance' => 'integer',
            'status' => WalletStatus::class,
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

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class, 'user_id', 'user_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', WalletStatus::Active->value);
    }

    public function scopeSuspended(Builder $query): Builder
    {
        return $query->where('status', WalletStatus::Suspended->value);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function canPay(int $amount): bool
    {
        return $this->status === WalletStatus::Active
            && $amount > 0
            && $this->withdrawable_balance >= $amount;
    }
}
