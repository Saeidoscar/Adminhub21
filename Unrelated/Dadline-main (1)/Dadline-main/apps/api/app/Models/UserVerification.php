<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserVerification extends Model
{
    protected $table = 'user_verifications';

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'verified_level',
        'mobile_verified',
        'mobile_verified_at',
        'national_verified',
        'national_data',
        'national_verified_at',
        'identity_locked_at',
        'bank_verified',
        'bank_verified_at',
        'bank_data',
        'iban_verified_at',
        'iban_data',
    ];

    protected $casts = [
        'mobile_verified' => 'boolean',
        'national_verified' => 'boolean',
        'bank_verified' => 'boolean',

        'national_data' => 'array',
        'bank_data' => 'array',
        'iban_data' => 'array',

        'mobile_verified_at' => 'datetime',
        'national_verified_at' => 'datetime',
        'identity_locked_at' => 'datetime',
        'bank_verified_at' => 'datetime',
        'iban_verified_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isVerified(): bool
    {
        return $this->verified_level >= 2;
    }
}
