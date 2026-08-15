<?php

namespace Tests\Unit;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ContentMigrationsTest extends TestCase
{
    /** @var list<Migration> */
    private array $migrations = [];

    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('users', function (Blueprint $table) {
            $table->id();
        });
        Schema::create('legal_categories', function (Blueprint $table) {
            $table->id();
        });
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
        });
    }

    protected function tearDown(): void
    {
        foreach (array_reverse($this->migrations) as $migration) {
            $migration->down();
        }

        Schema::dropIfExists('attachments');
        Schema::dropIfExists('legal_categories');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_content_migrations_create_the_corrected_schema(): void
    {
        foreach ([
            '0001_01_01_000015_create_tags_table.php',
            '0001_01_01_000016_create_stories_table.php',
            '0001_01_01_000017_create_blogs_table.php',
            '0001_01_01_000018_create_story_tag_table.php',
            '0001_01_01_000019_create_blog_tag_table.php',
            '0001_01_01_000020_create_comments_table.php',
            '0001_01_01_000021_create_content_reactions_table.php',
        ] as $file) {
            $migration = require database_path('migrations/'.$file);
            $migration->up();
            $this->migrations[] = $migration;
        }

        $this->assertTrue(Schema::hasColumns('stories', [
            'category_id',
            'featured_image_id',
            'published_at',
            'dislikes_count',
            'deleted_at',
        ]));
        $this->assertTrue(Schema::hasColumns('blogs', [
            'category_id',
            'featured_image_id',
            'published_at',
            'dislikes_count',
            'deleted_at',
        ]));
        $this->assertTrue(Schema::hasColumns('tags', ['is_active', 'deleted_at']));
        $this->assertFalse(Schema::hasColumn('tags', 'stories_count'));
        $this->assertFalse(Schema::hasColumn('tags', 'blogs_count'));
        $this->assertTrue(Schema::hasColumns('comments', [
            'public_id',
            'story_id',
            'blog_id',
            'parent_id',
            'deleted_at',
        ]));
        $this->assertTrue(Schema::hasColumns('content_reactions', [
            'user_id',
            'reactionable_type',
            'reactionable_id',
            'type',
        ]));
    }
}
