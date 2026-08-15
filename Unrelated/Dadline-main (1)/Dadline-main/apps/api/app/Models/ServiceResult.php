<?php

namespace App\Models;

use App\Enums\ServiceResultStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceResult extends Model
{
    public const UPDATED_AT = null;

    protected $attributes = [
        'status' => ServiceResultStatus::Draft->value,
    ];

    protected $fillable = [
        'request_id',
        'vendor_id',
        'result',
        'advice',
        'status',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'request_id' => 'integer',
            'vendor_id' => 'integer',
            'status' => ServiceResultStatus::class,
            'created_at' => 'datetime',
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
}
