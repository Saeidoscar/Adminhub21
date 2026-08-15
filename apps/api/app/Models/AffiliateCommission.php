<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateCommission extends Model
{
    protected $attributes = [
        'status' => 'pending',
    ];

    protected $fillable = [
        'affiliate_id',
        'rate',
        'amount',
        'source_tx_id',
        'commission_tx_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'affiliate_id' => 'integer',
            'source_tx_id' => 'integer',
            'commission_tx_id' => 'integer',
            'rate' => 'decimal:4',
            'amount' => 'integer',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function sourceTransaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'source_tx_id');
    }

    public function commissionTransaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'commission_tx_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', 'paid');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }
}
