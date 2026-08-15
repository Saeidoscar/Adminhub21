<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeTransaction extends Model
{
    protected $fillable = [
        'office_id',
        'case_id',
        'user_id',
        'type',
        'amount',
        'currency',
        'description',
        'reference',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'office_id' => 'integer',
            'case_id' => 'integer',
            'user_id' => 'integer',
            'amount' => 'decimal:2',
            'metadata' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function officeCase(): BelongsTo
    {
        return $this->belongsTo(OfficeCase::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
