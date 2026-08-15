<?php

namespace App\Models;

use App\Enums\UserSubscriptionPlan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSubscription extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'plan',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'plan' => UserSubscriptionPlan::class,
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function active(): bool
    {
        return $this->expires_at === null || $this->expires_at->isFuture();
    }
}
