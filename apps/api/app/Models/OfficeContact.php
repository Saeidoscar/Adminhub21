<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeContact extends Model
{
    protected $fillable = [
        'office_id',
        'user_id',
        'name',
        'email',
        'phone',
        'role',
    ];

    protected function casts(): array
    {
        return [
            'office_id' => 'integer',
            'user_id' => 'integer',
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
}
