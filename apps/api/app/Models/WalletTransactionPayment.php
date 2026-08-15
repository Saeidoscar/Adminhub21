<?php

namespace App\Models;

use App\Enums\WalletPaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransactionPayment extends Model
{
    protected $fillable = [
        'transaction_id',
        'gateway',
        'ref_num',
        'gateway_token',
        'authority',
        'rrn',
        'terminal_id',
        'card_number_masked',
        'amount',
        'gateway_fee',
        'status',
        'verified',
        'verified_at',
        'payment_url',
        'request_payload',
        'response_payload',
    ];

    protected function casts(): array
    {
        return [
            'transaction_id' => 'integer',
            'amount' => 'integer',
            'gateway_fee' => 'integer',
            'status' => WalletPaymentStatus::class,
            'verified' => 'boolean',
            'verified_at' => 'datetime',
            'request_payload' => 'array',
            'response_payload' => 'array',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'transaction_id');
    }
}
