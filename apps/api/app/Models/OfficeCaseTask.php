<?php

namespace App\Models;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Attributes\Hidden;
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
            'priority' => TaskPriority::class,
            'status' => TaskStatus::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function officeCase(): BelongsTo
    {
        return $this->belongsTo(OfficeCase::class, 'case_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereIn('status', [
            TaskStatus::Todo->value,
            TaskStatus::InProgress->value,
            TaskStatus::OnHold->value,
        ]);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', TaskStatus::Completed->value);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isOpen(): bool
    {
        return in_array($this->status, [
            TaskStatus::Todo->value,
            TaskStatus::InProgress->value,
            TaskStatus::OnHold->value,
        ], true);
    }

    public function isCompleted(): bool
    {
        return $this->status === TaskStatus::Completed->value;
    }

    public function statusLabel(): string
    {
        return TaskStatus::labelFor($this->status);
    }

    public function priorityLabel(): string
    {
        return TaskPriority::labelFor($this->priority);
    }
}
