<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\LegalCategory;
use App\Models\Story;
use App\Models\User;
use App\Services\OnlineUserService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Mockery\MockInterface;
use Tests\Concerns\BuildsContentSchema;
use Tests\TestCase;

class ContentApiTest extends TestCase
{
    use BuildsContentSchema;

    protected function setUp(): void
    {
        parent::setUp();
        config(['cache.stores.redis' => ['driver' => 'array']]);
        Cache::store('redis')->clear();
        $this->buildContentSchema();
        $this->mock(OnlineUserService::class, function (MockInterface $mock) {
            $mock->shouldReceive('markOnline')->zeroOrMoreTimes();
        });
    }

    protected function tearDown(): void
    {
        $this->dropContentSchema();
        parent::tearDown();
    }

    public function test_public_story_routes_only_expose_currently_published_content(): void
    {
        Story::query()->create([
            'title' => 'Visible',
            'slug' => 'visible',
            'content' => 'Visible content',
            'status' => ContentStatus::Published,
            'published_at' => now()->subMinute(),
        ]);
        Story::query()->create([
            'title' => 'Scheduled',
            'slug' => 'scheduled',
            'content' => 'Scheduled content',
            'status' => ContentStatus::Published,
            'published_at' => now()->addDay(),
        ]);
        Story::query()->create([
            'title' => 'Draft',
            'slug' => 'draft',
            'content' => 'Draft content',
        ]);

        $this->getJson('/v1/stories')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'visible');

        $this->getJson('/v1/stories/scheduled')->assertNotFound();
        $this->getJson('/v1/stories/draft')->assertNotFound();
    }

    public function test_public_content_views_are_tracked_once_per_viewer_each_day(): void
    {
        $story = Story::query()->create([
            'title' => 'Viewed story',
            'slug' => 'viewed-story',
            'content' => 'Story content',
            'status' => ContentStatus::Published,
            'published_at' => now()->subMinute(),
        ]);
        $story->forceFill(['views_count' => 4])->save();

        $blog = Blog::query()->create([
            'title' => 'Viewed blog',
            'slug' => 'viewed-blog',
            'content' => 'Blog content',
            'status' => ContentStatus::Published,
            'published_at' => now()->subMinute(),
        ]);
        $blog->forceFill(['views_count' => 8])->save();

        $firstViewer = (string) Str::uuid();
        $secondViewer = (string) Str::uuid();

        $this->getJson('/v1/stories/viewed-story')
            ->assertOk()
            ->assertJsonPath('data.viewsCount', 4);
        $this->assertSame(4, $story->fresh()->views_count);

        $this->postJson('/v1/stories/viewed-story/view', [
            'viewer_key' => $firstViewer,
        ])->assertNoContent();
        $this->postJson('/v1/stories/viewed-story/view', [
            'viewer_key' => $firstViewer,
        ])->assertNoContent();
        $this->postJson('/v1/stories/viewed-story/view', [
            'viewer_key' => $secondViewer,
        ])->assertNoContent();

        $this->postJson('/v1/blogs/viewed-blog/view', [
            'viewer_key' => $firstViewer,
        ])->assertNoContent();
        $this->postJson('/v1/blogs/viewed-blog/view', [
            'viewer_key' => $firstViewer,
        ])->assertNoContent();

        $this->assertSame(6, $story->fresh()->views_count);
        $this->assertSame(9, $blog->fresh()->views_count);
    }

    public function test_content_view_requires_valid_viewer_and_published_content(): void
    {
        Story::query()->create([
            'title' => 'Draft story',
            'slug' => 'draft-view-story',
            'content' => 'Draft content',
        ]);
        Blog::query()->create([
            'title' => 'Visible blog',
            'slug' => 'view-validation-blog',
            'content' => 'Blog content',
            'status' => ContentStatus::Published,
            'published_at' => now()->subMinute(),
        ]);

        $this->postJson('/v1/blogs/view-validation-blog/view', [
            'viewer_key' => 'invalid',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('viewer_key');

        $this->postJson('/v1/stories/draft-view-story/view', [
            'viewer_key' => (string) Str::uuid(),
        ])->assertNotFound();
    }

    public function test_authenticated_user_can_create_and_submit_a_story(): void
    {
        $user = User::query()->create([
            'mobile' => '09120000003',
            'first_name' => 'Sara',
            'role' => 'user',
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/v1/stories', [
            'title' => 'داستان من',
            'content' => 'متن داستان',
        ])->assertCreated();

        $slug = $response->json('data.slug');
        $this->postJson("/v1/stories/{$slug}/submit")
            ->assertOk()
            ->assertJsonPath('data.status', ContentStatus::Pending->value);
    }

    public function test_editor_role_can_create_a_blog(): void
    {
        $editor = User::query()->create([
            'mobile' => '09120000004',
            'first_name' => 'Editor',
            'role' => 'editor',
        ]);
        Sanctum::actingAs($editor);

        $this->postJson('/v1/admin/content/blogs', [
            'title' => 'مقاله حقوقی',
            'content' => 'متن مقاله',
        ])->assertCreated()
            ->assertJsonPath('data.status', ContentStatus::Draft->value);
    }

    public function test_public_content_can_be_searched_filtered_sorted_and_summarized(): void
    {
        $author = User::query()->create([
            'mobile' => '09120000005',
            'first_name' => 'Ali',
            'last_name' => 'Ahmadi',
        ]);
        $category = LegalCategory::query()->create([
            'name' => 'Family',
            'slug' => 'family',
        ]);

        $matchingStory = Story::query()->create([
            'user_id' => $author->getKey(),
            'category_id' => $category->getKey(),
            'title' => 'Family experience',
            'slug' => 'family-experience',
            'content' => 'Content',
            'status' => ContentStatus::Published,
            'published_at' => now()->subDay(),
        ]);
        $matchingStory->forceFill(['views_count' => 12, 'likes_count' => 4])->save();

        $unrelatedStory = Story::query()->create([
            'title' => 'Unrelated story',
            'slug' => 'unrelated-story',
            'content' => 'Content',
            'status' => ContentStatus::Published,
            'published_at' => now()->subHour(),
        ]);
        $unrelatedStory->forceFill(['views_count' => 100])->save();

        Comment::query()->create([
            'story_id' => $matchingStory->getKey(),
            'user_id' => $author->getKey(),
            'content' => 'Approved comment',
            'status' => 'approved',
        ]);
        Comment::query()->create([
            'story_id' => $matchingStory->getKey(),
            'user_id' => $author->getKey(),
            'content' => 'Pending comment',
            'status' => 'pending',
        ]);

        $this->getJson('/v1/stories?search=Ali&category=family&sort=comments')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'family-experience')
            ->assertJsonPath('data.0.commentsCount', 1)
            ->assertJsonPath('data.0.viewsCount', 12)
            ->assertJsonPath('data.0.likesCount', 4);

        $this->getJson('/v1/content/stats?type=story')
            ->assertOk()
            ->assertJsonPath('data.contentsCount', 2)
            ->assertJsonPath('data.viewsCount', 112)
            ->assertJsonPath('data.likesCount', 4)
            ->assertJsonPath('data.commentsCount', 1);
    }

    public function test_authenticated_user_can_toggle_reactions_and_submit_a_comment(): void
    {
        $user = User::query()->create([
            'mobile' => '09120000006',
            'first_name' => 'Reactor',
        ]);
        $story = Story::query()->create([
            'title' => 'Reactable story',
            'slug' => 'reactable-story',
            'content' => 'Content',
            'status' => ContentStatus::Published,
            'published_at' => now()->subMinute(),
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/v1/stories/reactable-story/reaction', ['reaction' => 'like'])
            ->assertOk()
            ->assertJsonPath('data.reaction', 'like')
            ->assertJsonPath('data.likesCount', 1)
            ->assertJsonPath('data.dislikesCount', 0);

        $this->postJson('/v1/stories/reactable-story/reaction', ['reaction' => 'dislike'])
            ->assertOk()
            ->assertJsonPath('data.reaction', 'dislike')
            ->assertJsonPath('data.likesCount', 0)
            ->assertJsonPath('data.dislikesCount', 1);

        $this->getJson('/v1/stories/reactable-story/reaction')
            ->assertOk()
            ->assertJsonPath('data.reaction', 'dislike');

        $this->postJson('/v1/stories/reactable-story/reaction', ['reaction' => 'dislike'])
            ->assertOk()
            ->assertJsonPath('data.reaction', null)
            ->assertJsonPath('data.dislikesCount', 0);

        $this->postJson('/v1/stories/reactable-story/comments', [
            'content' => 'A new experience comment',
        ])->assertCreated()
            ->assertJsonPath('data.content', 'A new experience comment');

        $this->assertDatabaseCount('content_reactions', 0);
        $this->assertDatabaseHas('comments', [
            'story_id' => $story->getKey(),
            'user_id' => $user->getKey(),
            'status' => 'pending',
        ]);
    }
}
