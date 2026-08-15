<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OfficeContact extends Model
{
    protected $fillable = [
        'office_id',
        'user_id',
        'full_name',
        'national_id',
        'mobile',
        'email',
        'organization',
        'address',
        'father_name',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'office_id' => 'integer',
            'user_id' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function caseParties(): HasMany
    {
        return $this->hasMany(OfficeCaseParty::class, 'contact_id');
    }
}
