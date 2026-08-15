<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class GiftCard extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'user_id',
        'code',
        'amount',
        'redemption_limit',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'redemption_limit' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function redemptions(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'gift_card_redemptions')
            ->withPivot('redeemed_at');
    }
}
