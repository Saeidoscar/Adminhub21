<?php

namespace App\Models;

use App\Enums\SignatureStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Signature extends Model
{
    protected $attributes = [
        'signature_status' => 'pending',
    ];

    protected $fillable = [
        'contract_id',
        'user_id',
        'full_name',
        'mobile',
        'verification_code',
        'code_expires_at',
        'signature_status',
        'ip_address',
        'user_agent',
        'metadata',
        'signature_id',
        'signed_at',
    ];

    protected function casts(): array
    {
        return [
            'contract_id' => 'integer',
            'user_id' => 'integer',
            'metadata' => 'array',
            'signature_id' => 'integer',
            'code_expires_at' => 'datetime',
            'signed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function signatureFile(): BelongsTo
    {
        return $this->belongsTo(Attachment::class, 'signature_id');
    }

    public function statusLabel(): string
    {
        return SignatureStatus::labelFor($this->signature_status);
    }
}
