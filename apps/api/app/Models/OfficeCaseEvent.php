<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeCaseEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'case_id',
        'title',
        'type',
        'notes',
        'event_at',
        'reminder_before',
        'reminder_sent',
    ];

    protected function casts(): array
    {
        return [
            'case_id' => 'integer',
            'event_at' => 'datetime',
            'reminder_before' => 'integer',
            'reminder_sent' => 'boolean',
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

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopePendingReminder(Builder $query): Builder
    {
        return $query->where('reminder_sent', false)
            ->where('reminder_before', '>', 0);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function hasReminder(): bool
    {
        return $this->reminder_before > 0;
    }

    public function reminderSent(): bool
    {
        return $this->reminder_sent === true;
    }
}
