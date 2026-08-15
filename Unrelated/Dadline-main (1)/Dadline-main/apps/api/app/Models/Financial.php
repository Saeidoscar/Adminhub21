<?php

namespace App\Models;

use App\Enums\FinancialDirection;
use App\Enums\FinancialStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Financial extends Model
{
    protected $attributes = [
        'vat_amount' => 0,
        'status' => FinancialStatus::Accepted->value,
        'payload' => '{}',
    ];

    protected $fillable = [
        'direction',
        'gross_amount',
        'vat_amount',
        'net_amount',
        'status',
        'item_id',
        'payload',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'direction' => FinancialDirection::class,
            'gross_amount' => 'integer',
            'vat_amount' => 'integer',
            'net_amount' => 'integer',
            'status' => FinancialStatus::class,
            'item_id' => 'integer',
            'payload' => 'array',
            'occurred_at' => 'datetime',
        ];
    }

    public function scopeIncome(Builder $query): Builder
    {
        return $query->where('direction', FinancialDirection::Income->value);
    }

    public function scopeExpenses(Builder $query): Builder
    {
        return $query->where('direction', FinancialDirection::Expense->value);
    }

    public function scopeAccepted(Builder $query): Builder
    {
        return $query->where('status', FinancialStatus::Accepted->value);
    }
}
