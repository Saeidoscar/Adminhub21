<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Story extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'author_id',
        'title',
        'content',
        'cover_url',
        'status',
        'views',
    ];

    protected $casts = [
        'views' => 'integer',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
