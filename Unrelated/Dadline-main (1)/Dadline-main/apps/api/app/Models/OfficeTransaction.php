<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OfficeTransaction extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'office_id',
        'case_id',
        'recorded_by',
        'correction_of_id',
        'direction',
        'related_party',
        'category',
        'amount',
        'description',
        'transaction_at',
    ];

    protected function casts(): array
    {
        return [
            'office_id' => 'integer',
            'case_id' => 'integer',
            'recorded_by' => 'integer',
            'correction_of_id' => 'integer',
            'amount' => 'integer',
            'transaction_at' => 'datetime',
        ];
    }

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function officeCase(): BelongsTo
    {
        return $this->belongsTo(OfficeCase::class, 'case_id');
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function correctionOf(): BelongsTo
    {
        return $this->belongsTo(OfficeTransaction::class, 'correction_of_id');
    }

    public function corrections(): HasMany
    {
        return $this->hasMany(OfficeTransaction::class, 'correction_of_id');
    }

    public function scopeIncome(Builder $query): Builder
    {
        return $query->where('direction', 'income');
    }

    public function scopeExpense(Builder $query): Builder
    {
        return $query->where('direction', 'expense');
    }
}
