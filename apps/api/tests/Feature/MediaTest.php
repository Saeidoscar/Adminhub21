<?php

namespace Tests\Feature;

use App\Models\Attachment;
use App\Services\Media\MediaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Media must not name a disk anywhere in the domain: `MEDIA_DISK` decides where
 * bytes live and `MEDIA_URL` decides where they are served from.
 */
class MediaTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_configured_disk_decides_where_uploads_land(): void
    {
        Storage::fake('media-test');
        config(['media.disk' => 'media-test']);

        $path = app(MediaService::class)->store(UploadedFile::fake()->create('avatar.png', 4, 'image/png'), 'avatars');

        $this->assertStringStartsWith('avatars/', $path);
        Storage::disk('media-test')->assertExists($path);
    }

    public function test_a_media_url_points_at_the_configured_origin(): void
    {
        config(['media.disk' => 'public', 'media.url' => 'https://cdn.example.test']);

        $attachment = new Attachment(['storage_key' => 'avatars/user-1.png']);

        $this->assertSame('https://cdn.example.test/avatars/user-1.png', $attachment->getUrl());
    }

    public function test_the_service_returns_null_for_missing_paths(): void
    {
        $service = app(MediaService::class);

        $this->assertNull($service->url(null));
        $this->assertNull($service->url(''));

        // Deleting a null path is a no-op rather than an exception.
        $service->delete(null);
    }
}
