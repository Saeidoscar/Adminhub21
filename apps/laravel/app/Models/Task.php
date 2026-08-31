<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\SupportCase;

class Task extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'case_id',
        'assigned_to',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
    ];

    public function case(): BelongsTo
    {
        return $this->belongsTo(SupportCase::class, 'case_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
