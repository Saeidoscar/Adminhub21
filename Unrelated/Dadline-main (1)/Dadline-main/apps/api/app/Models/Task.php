<?php

namespace App\Models;

use App\Enums\TaskPriority;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    public const CREATED_AT = null;

    protected $fillable = [
        'user_id',
        'title',
        'link',
        'is_viewed',
        'priority',
    ];

    protected function casts(): array
    {
        return [
            'is_viewed' => 'boolean',
            'priority' => TaskPriority::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
