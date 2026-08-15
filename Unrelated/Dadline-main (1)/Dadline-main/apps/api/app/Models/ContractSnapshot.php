<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractSnapshot extends Model
{
    protected $attributes = [
        'hash_algorithm' => 'sha256',
    ];

    protected $fillable = [
        'contract_id',
        'body_hash',
        'payload_hash',
        'hash_algorithm',
        'canonical_payload',
    ];

    protected function casts(): array
    {
        return [
            'contract_id' => 'integer',
            'canonical_payload' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

}
