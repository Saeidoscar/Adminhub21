<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateCommission extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code_id',
        'referrer_id',
        'referred_id',
        'amount_toman',
        'amount_usd',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'amount_toman' => 'integer',
        'amount_usd' => 'integer',
    ];

    public function code(): BelongsTo
    {
        return $this->belongsTo(AffiliateCode::class, 'code_id');
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referred(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_id');
    }
}
