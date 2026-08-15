<?php

namespace App\Models;

use App\Enums\ServiceOfferStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceOffer extends Model
{
    protected $attributes = [
        'status' => ServiceOfferStatus::Pending->value,
    ];

    protected $fillable = [
        'request_id',
        'vendor_id',
        'price',
        'description',
        'transaction_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'request_id' => 'integer',
            'vendor_id' => 'integer',
            'price' => 'integer',
            'transaction_id' => 'integer',
            'status' => ServiceOfferStatus::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class, 'request_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'transaction_id');
    }
}
