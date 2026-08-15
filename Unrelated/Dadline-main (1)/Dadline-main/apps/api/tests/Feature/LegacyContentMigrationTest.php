<?php

namespace Tests\Feature;

use App\Enums\CommentStatus;
use App\Enums\ContentStatus;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\Story;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\Concerns\BuildsContentSchema;
use Tests\TestCase;

class LegacyContentMigrationTest extends TestCase
{
    use BuildsContentSchema;

    private array $originalLegacyConnection;

    protected function setUp(): void
    {
        parent::setUp();

        $this->originalLegacyConnection = config('database.connections.legacy');
        DB::purge('legacy');
        config()->set('database.connections.legacy', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ]);

        $this->buildContentSchema();
        $this->buildLegacySchema();
    }

    protected function tearDown(): void
    {
        $this->dropContentSchema();
        DB::purge('legacy');
        config()->set('database.connections.legacy', $this->originalLegacyConnection);

        parent::tearDown();
    }

    public function test_legacy_blogs_stories_tags_and_nested_comments_are_migrated_idempotently(): void
    {
        User::query()->create([
            'id' => 1,
            'mobile' => '09120000001',
            'first_name' => 'Legacy',
        ]);

        DB::connection('legacy')->table('ad_posts')->insert([
            [
                'ID' => 101,
                'post_author' => 1,
                'post_date' => '2025-01-01 10:00:00',
                'post_content' => 'Legacy blog body',
                'post_title' => 'Legacy blog',
                'post_excerpt' => 'Legacy excerpt',
                'post_status' => 'publish',
                'post_name' => 'legacy-blog',
                'post_modified' => '2025-01-02 10:00:00',
                'post_type' => 'post',
            ],
            [
                'ID' => 201,
                'post_author' => 1,
                'post_date' => '2025-02-01 10:00:00',
                'post_content' => '',
                'post_title' => 'Story link',
                'post_excerpt' => '',
                'post_status' => 'publish',
                'post_name' => 'legacy-story',
                'post_modified' => '2025-02-01 10:00:00',
                'post_type' => 'story',
            ],
            [
                'ID' => 301,
                'post_author' => 1,
                'post_date' => '2025-03-01 10:00:00',
                'post_content' => 'Page body',
                'post_title' => 'Not a blog',
                'post_excerpt' => '',
                'post_status' => 'publish',
                'post_name' => 'not-a-blog',
                'post_modified' => '2025-03-01 10:00:00',
                'post_type' => 'page',
            ],
        ]);

        DB::connection('legacy')->table('ad_dad_story')->insert([
            'id' => 10,
            'user_id' => 1,
            'post_id' => 201,
            'title' => 'Legacy story',
            'content' => '<p>Story body</p>',
            'category' => 'خانواده، طلاق',
            'views' => 12,
            'likes' => 3,
            'status' => 'published',
            'created_at' => '2025-02-01 09:00:00',
            'updated_at' => '2025-02-02 09:00:00',
        ]);

        DB::connection('legacy')->table('ad_dad_story_comments')->insert([
            [
                'id' => 50,
                'story_id' => 10,
                'user_id' => 1,
                'content' => 'Parent comment',
                'parent_id' => 0,
                'likes' => 2,
                'dislikes' => 0,
                'status' => 'approved',
                'created_at' => '2025-02-03 09:00:00',
            ],
            [
                'id' => 51,
                'story_id' => 10,
                'user_id' => 1,
                'content' => 'Reply comment',
                'parent_id' => 50,
                'likes' => 1,
                'dislikes' => 1,
                'status' => 'approved',
                'created_at' => '2025-02-04 09:00:00',
            ],
        ]);

        $this->artisan('dadline:migrate', ['--only' => 'blogs'])->assertSuccessful();
        $this->artisan('dadline:migrate', ['--only' => 'stories'])->assertSuccessful();
        $this->artisan('dadline:migrate', ['--only' => 'story-comments'])->assertSuccessful();

        $blog = Blog::query()->findOrFail(101);
        $story = Story::query()->with('tags')->findOrFail(10);
        $reply = Comment::query()->findOrFail(51);

        $this->assertSame('legacy-blog', $blog->slug);
        $this->assertSame(ContentStatus::Published, $blog->status);
        $this->assertSame('legacy-story', $story->slug);
        $this->assertSame(12, $story->views_count);
        $this->assertSame(3, $story->likes_count);
        $this->assertEqualsCanonicalizing(
            ['خانواده', 'طلاق'],
            $story->tags->pluck('name')->all(),
        );
        $this->assertSame(50, $reply->parent_id);
        $this->assertSame(CommentStatus::Approved, $reply->status);
        $this->assertSame(1, $reply->likes_count);
        $this->assertNotNull($reply->public_id);
        $this->assertDatabaseMissing('blogs', ['id' => 301]);

        $this->artisan('dadline:migrate', ['--only' => 'blogs'])->assertSuccessful();
        $this->artisan('dadline:migrate', ['--only' => 'stories'])->assertSuccessful();
        $this->artisan('dadline:migrate', ['--only' => 'story-comments'])->assertSuccessful();

        $this->assertSame(1, Blog::query()->count());
        $this->assertSame(1, Story::query()->count());
        $this->assertSame(2, Comment::query()->count());
    }

    private function buildLegacySchema(): void
    {
        Schema::connection('legacy')->create('ad_posts', function (Blueprint $table) {
            $table->unsignedBigInteger('ID')->primary();
            $table->unsignedBigInteger('post_author')->default(0);
            $table->dateTime('post_date');
            $table->text('post_content');
            $table->text('post_title');
            $table->text('post_excerpt');
            $table->string('post_status');
            $table->string('post_name');
            $table->dateTime('post_modified');
            $table->string('post_type');
        });

        Schema::connection('legacy')->create('ad_dad_story', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('post_id')->nullable();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->string('category')->nullable();
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('likes')->default(0);
            $table->string('status')->default('draft');
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });

        Schema::connection('legacy')->create('ad_dad_story_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('story_id');
            $table->unsignedBigInteger('user_id');
            $table->text('content');
            $table->unsignedBigInteger('parent_id')->default(0);
            $table->unsignedBigInteger('likes')->default(0);
            $table->unsignedBigInteger('dislikes')->default(0);
            $table->string('status')->default('draft');
            $table->timestamp('created_at')->nullable();
        });
    }
}
