<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Blog extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'author_id',
        'title',
        'content',
        'cover_url',
        'status',
        'published_at',
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
