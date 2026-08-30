<?php

namespace App\Models;

use App\Enums\ContractClauseType;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractClause extends Model
{
    protected $fillable = [
        'contract_id',
        'type',
        'title',
        'content',
        'is_accepted',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => ContractClauseType::class,
            'is_accepted' => 'boolean',
            'accepted_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function scopeAccepted($query): void
    {
        $query->where('is_accepted', true);
    }

    public function scopePending($query): void
    {
        $query->where('is_accepted', false);
    }
}
