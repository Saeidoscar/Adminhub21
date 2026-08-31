<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'post_id',
        'post_type',
        'author_id',
        'parent_id',
        'body',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
