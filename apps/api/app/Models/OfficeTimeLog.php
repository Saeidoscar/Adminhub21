<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeTimeLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'case_id',
        'user_id',
        'duration',
        'description',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'case_id' => 'integer',
            'user_id' => 'integer',
            'duration' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function officeCase(): BelongsTo
    {
        return $this->belongsTo(OfficeCase::class, 'case_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
