<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateCommission extends Model
{
    protected $attributes = [
        'status' => 'pending',
    ];

    protected $fillable = [
        'affiliate_id',
        'source_tx_id',
        'commission_tx_id',
        'rate',
        'amount',
        'status',
        'release_at',
        'released_at',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'affiliate_id' => 'integer',
            'source_tx_id' => 'integer',
            'commission_tx_id' => 'integer',
            'rate' => 'decimal:4',
            'amount' => 'integer',
            'release_at' => 'datetime',
            'released_at' => 'datetime',
            'payload' => 'array',
        ];
    }

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
}
