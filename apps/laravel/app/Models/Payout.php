<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'amount_toman',
        'amount_usd',
        'currency',
        'method',
        'account_details',
        'status',
        'processed_at',
        'processed_by',
        'note',
    ];

    protected $casts = [
        'amount_toman' => 'integer',
        'amount_usd' => 'integer',
        'account_details' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
