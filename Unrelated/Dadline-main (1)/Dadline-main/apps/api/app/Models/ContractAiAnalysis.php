<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractAiAnalysis extends Model
{
    protected $fillable = [
        'contract_id',
        'ai_data',
        'ai_content',
    ];

    protected function casts(): array
    {
        return [
            'contract_id' => 'integer',
            'ai_data' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}
