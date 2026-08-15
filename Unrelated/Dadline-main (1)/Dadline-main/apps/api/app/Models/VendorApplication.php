<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Enums\VendorApplicationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorApplication extends Model
{
    protected $attributes = [
        'status' => VendorApplicationStatus::Pending->value,
    ];

    protected $fillable = [
        'user_id',
        'target_role',
        'price',
        'message',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'target_role' => UserRole::class,
            'price' => 'integer',
            'status' => VendorApplicationStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', VendorApplicationStatus::Pending);
    }

    public function scopeAccepted(Builder $query): Builder
    {
        return $query->where('status', VendorApplicationStatus::Accepted);
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', VendorApplicationStatus::Rejected);
    }
}
