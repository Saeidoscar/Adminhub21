<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'wallet_id',
        'type',
        'amount_toman',
        'amount_usd',
        'currency',
        'status',
        'reference_id',
        'note',
    ];

    protected $casts = [
        'amount_toman' => 'integer',
        'amount_usd' => 'integer',
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'wallet_id');
    }
}
