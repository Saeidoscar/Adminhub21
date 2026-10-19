<?php

namespace App\Services\Media;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

/**
 * The single entry point for user-uploaded files.
 *
 * Nothing in the domain should name a disk directly: `MEDIA_DISK` decides where
 * bytes live and `MEDIA_URL` decides where they are served from, which is how a
 * local stack and a CDN-backed deployment run the same code.
 */
class MediaService
{
    public function disk(): Filesystem
    {
        return Storage::disk($this->diskName());
    }

    public function diskName(): string
    {
        return config('media.disk', 'public');
    }

    /**
     * Store an uploaded file and return its disk-relative path.
     */
    public function store(\Illuminate\Http\UploadedFile $file, string $directory): string
    {
        return $file->store($directory, $this->diskName());
    }

    public function delete(?string $path): void
    {
        if (blank($path)) {
            return;
        }

        $this->disk()->delete($path);
    }

    /**
     * A public URL for the file, served from the CDN when MEDIA_URL is set.
     *
     * The prefix is applied here rather than left to each disk's `url` option so
     * that switching MEDIA_URL takes effect without touching filesystem config.
     */
    public function url(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        $path = ltrim($path, '/');
        $base = config('media.url');

        return filled($base)
            ? rtrim((string) $base, '/') . '/' . $path
            : $this->disk()->url($path);
    }
}
