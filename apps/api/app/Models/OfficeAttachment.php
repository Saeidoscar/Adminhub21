<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class OfficeAttachment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'id',
        'case_id',
        'user_id',
        'storage_key',
        'original_name',
        'mime_type',
        'size_bytes',
        'is_private',
        'created_at',
    ];

    protected $casts = [
        'case_id' => 'integer',
        'user_id' => 'integer',
        'size_bytes' => 'integer',
        'is_private' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function officeCase(): BelongsTo
    {
        return $this->belongsTo(OfficeCase::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getUrlAttribute(): ?string
    {
        return blank($this->storage_key) ? null : Storage::disk('s3')->url($this->storage_key);
    }
}
