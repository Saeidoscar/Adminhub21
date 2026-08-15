<?php

namespace App\Models;

use App\Enums\PurchaseIntentStatus;
use App\Enums\WalletTransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseIntent extends Model
{
    protected $attributes = [
        'status' => PurchaseIntentStatus::PendingWallet->value,
        'payload' => '{}',
    ];

    protected $fillable = [
        'uuid',
        'user_id',
        'charge_transaction_id',
        'purchase_transaction_id',
        'purchase_type',
        'purchasable_id',
        'vendor_id',
        'amount',
        'wallet_type',
        'status',
        'payload',
        'paid_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'charge_transaction_id' => 'integer',
            'purchase_transaction_id' => 'integer',
            'purchasable_id' => 'integer',
            'vendor_id' => 'integer',
            'amount' => 'integer',
            'wallet_type' => WalletTransactionType::class,
            'status' => PurchaseIntentStatus::class,
            'payload' => 'array',
            'paid_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function chargeTransaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'charge_transaction_id');
    }

    public function purchaseTransaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'purchase_transaction_id');
    }
}
