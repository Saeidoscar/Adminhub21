<?php

namespace App\Models;

use App\Enums\PhoneConsultationStatus;
use App\Enums\PhoneConsultationVendorRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PhoneConsultation extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'user_id',
        'vendor_id',
        'category_id',
        'text',
        'vendor_role',
        'minutes',
        'price',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'vendor_role' => PhoneConsultationVendorRole::class,
            'minutes' => 'integer',
            'price' => 'integer',
            'status' => PhoneConsultationStatus::class,
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(LegalCategory::class, 'category_id');
    }
}
