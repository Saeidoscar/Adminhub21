<?php

namespace App\Models;

use App\Enums\DodbotPurchaseStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DodbotPurchase extends Model
{
    protected $attributes = [
        'status' => DodbotPurchaseStatus::Pending->value,
    ];

    protected $fillable = [
        'user_id',
        'transaction_id',
        'tokens',
        'price',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'transaction_id' => 'integer',
            'tokens' => 'integer',
            'price' => 'integer',
            'status' => DodbotPurchaseStatus::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'transaction_id');
    }
}
