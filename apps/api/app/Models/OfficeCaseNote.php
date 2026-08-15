<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeCaseNote extends Model
{
    protected $fillable = [
        'case_id',
        'user_id',
        'type',
        'text',
    ];

    protected function casts(): array
    {
        return [
            'case_id' => 'integer',
            'user_id' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
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
