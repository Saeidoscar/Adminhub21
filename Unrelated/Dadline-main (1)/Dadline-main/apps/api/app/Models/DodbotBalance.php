<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DodbotBalance extends Model
{
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    public const CREATED_AT = null;

    public const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'user_id',
        'balance',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'balance' => 'integer',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
