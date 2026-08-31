<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioItem extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'admin_id',
        'title',
        'description',
        'media_url',
        'media_type',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminProfile::class, 'admin_id');
    }
}
