<?php

namespace App\Models;

use App\Services\Media\MediaService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends Model
{
    public $timestamps = false;

    protected $appends = [
        'url',
    ];

    protected $fillable = [
        'id',
        'user_id',
        'storage_key',
        'original_name',
        'mime_type',
        'size_bytes',
        'is_private',
        'created_at',
    ];

    protected $casts = [
        'is_private' => 'boolean',
        'size_bytes' => 'integer',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getUrlAttribute(): ?string
    {
        return $this->getUrl();
    }

    public function getUrl(
        bool $private = false,
        int $expiresInMinutes = 30
    ): ?string {
        if (blank($this->storage_key)) {
            return null;
        }

        $media = app(MediaService::class);

        if ($private) {
            return $media->disk()->temporaryUrl(
                $this->storage_key,
                now()->addMinutes($expiresInMinutes)
            );
        }

        // Public URLs honour MEDIA_URL, so a CDN origin is applied in one place.
        return $media->url($this->storage_key);
    }
}
