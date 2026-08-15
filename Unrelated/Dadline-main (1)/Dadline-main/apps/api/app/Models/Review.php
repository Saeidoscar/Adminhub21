<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'reviewer_id',
        'vendor_id',
        'type',
        'item_id',
        'rate',
        'review',
        'status',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'rate' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }
}
