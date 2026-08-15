<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExternalServiceRequest extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'purchase_intent_id',
        'wallet_transaction_id',
        'provider',
        'service',
        'status',
        'http_status',
        'provider_code',
        'provider_message',
        'request_fingerprint',
        'request_payload',
        'response_payload',
        'duration_ms',
        'retryable',
        'billable',
        'billed_amount',
        'responded_at',
        'billed_at',
    ];

    protected function casts(): array
    {
        return [
            'request_payload' => 'array',
            'response_payload' => 'array',
            'http_status' => 'integer',
            'provider_code' => 'integer',
            'duration_ms' => 'integer',
            'retryable' => 'boolean',
            'billable' => 'boolean',
            'billed_amount' => 'integer',
            'responded_at' => 'datetime',
            'billed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function purchaseIntent(): BelongsTo
    {
        return $this->belongsTo(PurchaseIntent::class);
    }

    public function walletTransaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class);
    }
}
