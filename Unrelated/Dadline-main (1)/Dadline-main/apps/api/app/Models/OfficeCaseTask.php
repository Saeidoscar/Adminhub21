<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeCaseTask extends Model
{
    protected $fillable = [
        'case_id',
        'assignee_id',
        'title',
        'description',
        'deadline',
        'priority',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'case_id' => 'integer',
            'assignee_id' => 'integer',
            'deadline' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function officeCase(): BelongsTo
    {
        return $this->belongsTo(OfficeCase::class, 'case_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereIn('status', ['todo', 'in_progress', 'on_hold']);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }
}
