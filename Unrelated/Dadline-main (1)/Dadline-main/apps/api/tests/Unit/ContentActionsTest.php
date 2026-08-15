<?php

namespace Tests\Unit;

use App\Actions\Content\CreateCommentAction;
use App\Actions\Content\SaveStoryAction;
use App\Actions\Content\TransitionContentStatusAction;
use App\Enums\ContentStatus;
use App\Models\Comment;
use App\Models\LegalCategory;
use App\Models\Story;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Tests\Concerns\BuildsContentSchema;
use Tests\TestCase;

class ContentActionsTest extends TestCase
{
    use BuildsContentSchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->buildContentSchema();
    }

    protected function tearDown(): void
    {
        $this->dropContentSchema();
        parent::tearDown();
    }

    public function test_story_action_generates_unicode_slug_and_syncs_category_and_tags(): void
    {
        $user = User::query()->create(['mobile' => '09120000001', 'first_name' => 'Ali']);
        LegalCategory::query()->create(['name' => 'Family', 'slug' => 'family']);
        Tag::query()->create(['name' => 'Divorce', 'slug' => 'divorce']);

        $story = app(SaveStoryAction::class)->execute(null, $user, [
            'title' => 'حقوق خانواده در ایران',
            'content' => 'Content',
            'category_slug' => 'family',
            'tag_slugs' => ['divorce'],
        ]);

        $this->assertSame('حقوق-خانواده-در-ایران', $story->slug);
        $this->assertSame('family', $story->legalCategory->slug);
        $this->assertSame(['divorce'], $story->tags->pluck('slug')->all());
    }

    public function test_transition_action_enforces_workflow_and_scheduled_publication(): void
    {
        $story = Story::query()->create([
            'title' => 'Story',
            'slug' => 'story',
            'content' => 'Content',
        ]);
        $action = app(TransitionContentStatusAction::class);

        $story = $action->execute($story, ContentStatus::Pending);
        $story = $action->execute($story, ContentStatus::Published, [
            'published_at' => now()->addDay()->toIso8601String(),
        ]);

        $this->assertSame(ContentStatus::Published, $story->status);
        $this->assertFalse(Story::query()->published()->whereKey($story)->exists());

        $this->expectException(ValidationException::class);
        $action->execute($story, ContentStatus::Draft);
    }

    public function test_comment_action_rejects_a_parent_from_another_target(): void
    {
        $user = User::query()->create(['mobile' => '09120000002']);
        $first = Story::query()->create(['title' => 'First', 'slug' => 'first', 'content' => 'A']);
        $second = Story::query()->create(['title' => 'Second', 'slug' => 'second', 'content' => 'B']);
        $parent = Comment::query()->create([
            'story_id' => $first->id,
            'user_id' => $user->id,
            'content' => 'Parent',
        ]);

        $this->expectException(ValidationException::class);
        app(CreateCommentAction::class)->execute($second, $user, [
            'content' => 'Reply',
            'parent_public_id' => $parent->public_id,
        ]);
    }
}
