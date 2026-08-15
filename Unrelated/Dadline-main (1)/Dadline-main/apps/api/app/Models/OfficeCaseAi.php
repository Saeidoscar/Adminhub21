<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeCaseAi extends Model
{
    protected $table = 'office_case_ai';

    public $timestamps = false;

    protected $fillable = [
        'case_id',
        'service_name',
        'model',
        'tokens_used',
        'result',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'case_id' => 'integer',
            'tokens_used' => 'integer',
            'result' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function officeCase(): BelongsTo
    {
        return $this->belongsTo(OfficeCase::class, 'case_id');
    }
}
