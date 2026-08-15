<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeCaseParty extends Model
{
    protected $fillable = [
        'case_id',
        'user_id',
        'name',
        'role',
        'phone',
        'email',
        'national_id',
    ];

    protected function casts(): array
    {
        return [
            'case_id' => 'integer',
            'user_id' => 'integer',
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
