<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeCaseParty extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'case_id',
        'contact_id',
        'role',
        'is_client',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'case_id' => 'integer',
            'contact_id' => 'integer',
            'is_client' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function officeCase(): BelongsTo
    {
        return $this->belongsTo(OfficeCase::class, 'case_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(OfficeContact::class);
    }

    public function scopeClients(Builder $query): Builder
    {
        return $query->where('is_client', true);
    }
}
