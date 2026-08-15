<?php

namespace App\Console\Commands;

use App\Enums\CommentStatus;
use App\Enums\ContentStatus;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\LawArticle;
use App\Models\LawCategory;
use App\Models\LawSection;
use App\Models\LawTitle;
use App\Models\LawVersion;
use App\Models\LegalCategory;
use App\Models\Question;
use App\Models\QuestionAnswer;
use App\Models\Review;
use App\Models\Story;
use App\Models\Tag;
use App\Models\Terminology;
use App\Models\User;
use App\Support\UniqueSlugGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class MigratePart3
{
    private const CHUNK_SIZE = 500;

    private const TYPES = [
        'doc',
        'case',
        'q_answer',
        'phone',
        'site',
        'vendor',
    ];

    private const STATUSES = [
        'rejected',
        'approved',
        'hidden',
    ];

    public function __construct(
        private Command $console
    ) {}

    public function migrateReviews(bool $dryRun): void
    {
        $this->console->info('Migrating Reviews...');

        $query = MigrateHelper::legacy('ad_dad_review');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $created = 0;
        $skipped = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$created,
            &$skipped,
            &$missingUsers,
            &$invalidRows
        ): void {
            $existingReviewIds = Review::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $userIds = $rows->pluck('user_id')
                ->merge($rows->pluck('vendor_id'))
                ->unique()
                ->values();
            $existingUserIds = User::whereIn('id', $userIds)
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingReviewIds->has($row->id)) {
                    $skipped++;
                    $bar->advance();

                    continue;
                }

                if (! $existingUserIds->has($row->user_id) || ! $existingUserIds->has($row->vendor_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                if (! in_array($row->type, self::TYPES, true)
                    || ($row->status !== null && ! in_array($row->status, self::STATUSES, true))) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Review {$row->id} => vendor {$row->vendor_id}");
                } else {
                    Review::create([
                        'id' => $row->id,
                        'reviewer_id' => $row->user_id,
                        'vendor_id' => $row->vendor_id,
                        'type' => $row->type,
                        'item_id' => $row->item_id,
                        'rate' => rand(3, 5),
                        'review' => $row->review,
                        'status' => $row->status ?? 'approved',
                        'created_at' => $row->created_at ?? now(),
                    ]);
                }

                $created++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Reviews migrated: {$created}; already existed: {$skipped}.");
        $this->console->warn("Reviews skipped because a user was missing: {$missingUsers}.");
        $this->console->warn("Reviews skipped because type or status was invalid: {$invalidRows}.");
    }

    public function migrateQuestions(bool $dryRun): void
    {
        $this->console->info('Migrating Questions...');

        $query = MigrateHelper::legacy('ad_dad_question_conseling');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $categories = LegalCategory::query()->pluck('id', 'slug');
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $missingCategories = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            $categories,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$missingCategories,
            &$invalidRows
        ): void {
            $existingIds = Question::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $users = User::query()
                ->whereIn('id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->user_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $status = $this->questionStatus($row->status);

                if ($status === null || blank($row->title) || blank($row->text)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $categoryId = $categories->get(trim((string) $row->category));

                if ($categoryId === null) {
                    $missingCategories++;
                }

                if ($dryRun) {
                    $this->console->line("Question {$row->id} => {$row->title}");
                } else {
                    $question = new Question;
                    $question->id = $row->id;
                    $question->fill([
                        'uuid' => (string) Str::uuid(),
                        'user_id' => $row->user_id,
                        'title' => $row->title,
                        'body' => $row->text,
                        'category_id' => $categoryId,
                        'is_private' => (bool) $row->private,
                        'slug' => $this->slugger()->generate(
                            Question::class,
                            rawurldecode(trim((string) $row->slug)) ?: $row->title,
                        ),
                        'status' => $status,
                    ]);
                    $question->created_at = $this->legacyDate($row->created_at) ?? now();
                    $question->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Questions migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Questions skipped because the user was missing: {$missingUsers}.");
        $this->console->warn("Questions with an unmapped category: {$missingCategories}.");
        $this->console->warn("Questions skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateQuestionAnswers(bool $dryRun): void
    {
        $this->console->info('Migrating Question Answers...');

        $query = MigrateHelper::legacy('ad_dad_answer_conseling');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingReferences = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingReferences,
            &$invalidRows
        ): void {
            $existingIds = QuestionAnswer::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $questions = Question::query()
                ->whereIn('id', $rows->pluck('question_id')->filter()->unique())
                ->pluck('id')
                ->flip();
            $vendors = User::query()
                ->whereIn('id', $rows->pluck('vendor_id')->filter()->unique())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $questions->has($row->question_id) || ! $vendors->has($row->vendor_id)) {
                    $missingReferences++;
                    $bar->advance();

                    continue;
                }

                $status = $this->questionAnswerStatus($row->status);

                if ($status === null || blank($row->text)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Question answer {$row->id} => question {$row->question_id}");
                } else {
                    $answer = new QuestionAnswer;
                    $answer->id = $row->id;
                    $answer->fill([
                        'question_id' => $row->question_id,
                        'vendor_id' => $row->vendor_id,
                        'body' => $row->text,
                        'status' => $status,
                    ]);
                    $answer->created_at = $this->legacyDate($row->created_at) ?? now();
                    $answer->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Question answers migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Question answers skipped because a question or vendor was missing: {$missingReferences}.");
        $this->console->warn("Question answers skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateLawCategories(bool $dryRun): void
    {
        $this->console->info('ad_dad_laws_category to law_categories...');

        $query = MigrateHelper::legacy('ad_dad_laws_category');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $versionId = $this->currentLawVersionId();
        $migrated = 0;
        $existing = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            $versionId,
            &$migrated,
            &$existing,
            &$invalidRows
        ): void {
            $existingIds = LawCategory::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (blank($row->category)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if (! $dryRun) {
                    $category = new LawCategory;
                    $category->id = $row->id;
                    $category->fill([
                        'version_id' => $versionId,
                        'name' => $row->category,
                    ]);
                    $category->updated_at = $row->updated_at ?? now();
                    $category->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Law categories migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Law categories skipped because their data was invalid: {$invalidRows}.");
    }

    private function currentLawVersionId(): int
    {
        $versionId = LawVersion::published()
            ->latest('published_at')
            ->value('id');

        if ($versionId !== null) {
            return (int) $versionId;
        }

        $version = LawVersion::create([
            'label' => 'Initial import',
            'status' => 'published',
            'published_at' => now(),
        ]);

        return (int) $version->id;
    }

    public function migrateLawTitles(bool $dryRun): void
    {
        $this->console->info('ad_dad_laws_title to law_titles...');

        $query = MigrateHelper::legacy('ad_dad_laws_title');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingCategories = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingCategories,
            &$invalidRows
        ): void {
            $existingIds = LawTitle::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $categories = LawCategory::whereIn('id', $rows->pluck('category_id')->filter()->unique())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $categories->has($row->category_id)) {
                    $missingCategories++;
                    $bar->advance();

                    continue;
                }

                if (blank($row->title)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if (! $dryRun) {
                    $title = new LawTitle;
                    $title->id = $row->id;
                    $title->fill([
                        'category_id' => $row->category_id,
                        'title' => $row->title,
                    ]);
                    $title->updated_at = $row->updated_at ?? now();
                    $title->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Law titles migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Law titles skipped because the category was missing: {$missingCategories}.");
        $this->console->warn("Law titles skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateLawSections(bool $dryRun): void
    {
        $this->console->info('ad_dad_laws_sections to law_sections...');

        $query = MigrateHelper::legacy('ad_dad_laws_sections');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingTitles = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingTitles
        ): void {
            $existingIds = LawSection::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $titles = LawTitle::whereIn('id', $rows->pluck('title_id')->filter()->unique())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $titles->has($row->title_id)) {
                    $missingTitles++;
                    $bar->advance();

                    continue;
                }

                if (! $dryRun) {
                    $section = new LawSection;
                    $section->id = $row->id;
                    $section->fill([
                        'title_id' => $row->title_id,
                        'name' => filled($row->section) ? $row->section : "Legacy section {$row->id}",
                    ]);
                    $section->updated_at = $row->updated_at ?? now();
                    $section->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Law sections migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Law sections skipped because the title was missing: {$missingTitles}.");
    }

    public function migrateLawArticles(bool $dryRun): void
    {
        $this->console->info('ad_dad_laws_articles to law_articles...');

        $query = MigrateHelper::legacy('ad_dad_laws_articles');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingSections = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingSections,
            &$invalidRows
        ): void {
            $existingIds = LawArticle::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $sections = LawSection::whereIn('id', $rows->pluck('section_id')->filter()->unique())
                ->pluck('id')
                ->flip();
            $inserts = [];

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $sections->has($row->section_id)) {
                    $missingSections++;
                    $bar->advance();

                    continue;
                }

                if (blank($row->content) || (int) $row->order < 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if (! $dryRun) {
                    $inserts[] = [
                        'id' => $row->id,
                        'section_id' => $row->section_id,
                        'content' => $row->content,
                        'display_order' => $row->order,
                        'updated_at' => $row->updated_at ?? now(),
                    ];
                }

                $migrated++;
                $bar->advance();
            }

            if ($inserts !== []) {
                DB::table('law_articles')->insert($inserts);
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Law articles migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Law articles skipped because the section was missing: {$missingSections}.");
        $this->console->warn("Law articles skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateTerminology(bool $dryRun): void
    {
        $this->console->info('ad_dad_terminology to terminology...');

        $query = MigrateHelper::legacy('ad_dad_terminology');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $columns = MigrateHelper::legacyColumns('ad_dad_terminology');
        $titleColumn = $this->firstExistingColumn($columns, ['title', 'term', 'terminology', 'word', 'name']);
        $descriptionColumn = $this->firstExistingColumn($columns, ['description', 'content', 'body', 'text', 'meaning']);
        $createdAtColumn = $this->firstExistingColumn($columns, ['created_at', 'created', 'date']);
        $migrated = 0;
        $existing = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            $titleColumn,
            $descriptionColumn,
            $createdAtColumn,
            &$migrated,
            &$existing,
            &$invalidRows
        ): void {
            $existingIds = Terminology::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $inserts = [];

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                $title = Str::limit(trim(strip_tags((string) $this->legacyColumnValue($row, $titleColumn))), 255, '');
                $description = $this->legacyColumnValue($row, $descriptionColumn);

                if (blank($title)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Terminology {$row->id} => {$title}");
                } else {
                    $inserts[] = [
                        'id' => $row->id,
                        'title' => $title,
                        'description' => filled($description) ? $description : null,
                        'created_at' => $this->legacyDate($this->legacyColumnValue($row, $createdAtColumn)) ?? now(),
                    ];
                }

                $migrated++;
                $bar->advance();
            }

            if ($inserts !== []) {
                DB::table('terminology')->insert($inserts);
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Terminology migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Terminology skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateBlogs(bool $dryRun): void
    {
        $this->console->info('Migrating Blogs...');

        $query = MigrateHelper::legacy('ad_posts')->where('post_type', 'post');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;

        $query->orderBy('ID')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingUsers
        ): void {
            $existingIds = Blog::query()
                ->whereIn('id', $rows->pluck('ID'))
                ->pluck('id')
                ->flip();
            $users = User::query()
                ->whereIn('id', $rows->pluck('post_author')->filter())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->ID)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                $userId = $users->has($row->post_author) ? (int) $row->post_author : null;

                if ((int) $row->post_author > 0 && $userId === null) {
                    $missingUsers++;
                }

                if ($dryRun) {
                    $this->console->line("Post {$row->ID} => blog");
                } else {
                    $status = $this->blogStatus($row->post_status);
                    $publishedAt = $status === ContentStatus::Published
                        ? ($this->legacyDate($row->post_date) ?? $this->legacyDate($row->post_modified) ?? now())
                        : null;
                    $blog = new Blog;
                    $blog->id = $row->ID;
                    $blog->fill([
                        'user_id' => $userId,
                        'title' => Str::limit(trim($row->post_title) ?: "Legacy blog {$row->ID}", 500, ''),
                        'slug' => $this->slugger()->generate(
                            Blog::class,
                            rawurldecode(trim($row->post_name)) ?: $row->post_title,
                        ),
                        'excerpt' => filled($row->post_excerpt) ? $row->post_excerpt : null,
                        'content' => $row->post_content,
                        'status' => $status,
                        'published_at' => $publishedAt,
                    ]);
                    $blog->created_at = $this->legacyDate($row->post_date) ?? now();
                    $blog->updated_at = $this->legacyDate($row->post_modified) ?? $blog->created_at;
                    $blog->save();
                }

                $migrated++;
                $bar->advance();
            }
        }, 'ID', 'ID');

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Blogs migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Blogs whose legacy author was missing: {$missingUsers}.");
    }

    public function migrateStories(bool $dryRun): void
    {
        $this->console->info('Migrating Stories...');

        $query = MigrateHelper::legacy('ad_dad_story');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $missingPosts = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$missingPosts
        ): void {
            $existingIds = Story::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $users = User::query()
                ->whereIn('id', $rows->pluck('user_id')->filter())
                ->pluck('id')
                ->flip();
            $posts = MigrateHelper::legacy('ad_posts')
                ->whereIn('ID', $rows->pluck('post_id')->filter())
                ->get(['ID', 'post_name', 'post_date'])
                ->keyBy('ID');

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                $userId = $users->has($row->user_id) ? (int) $row->user_id : null;
                $post = $posts->get($row->post_id);

                if ($userId === null) {
                    $missingUsers++;
                }

                if ($row->post_id !== null && $post === null) {
                    $missingPosts++;
                }

                if ($dryRun) {
                    $this->console->line("Story {$row->id} => {$row->title}");
                } else {
                    DB::transaction(function () use ($row, $userId, $post): void {
                        $status = $this->storyStatus($row->status);
                        $createdAt = $this->legacyDate($row->created_at) ?? now();
                        $story = new Story;
                        $story->id = $row->id;
                        $story->fill([
                            'user_id' => $userId,
                            'title' => Str::limit(trim($row->title) ?: "Legacy story {$row->id}", 500, ''),
                            'slug' => $this->slugger()->generate(
                                Story::class,
                                rawurldecode(trim($post?->post_name ?? '')) ?: $row->title,
                            ),
                            'excerpt' => Str::limit(trim(strip_tags($row->content ?? '')), 500),
                            'content' => $row->content ?? '',
                            'status' => $status,
                            'published_at' => $status === ContentStatus::Published
                                ? ($this->legacyDate($post?->post_date) ?? $createdAt)
                                : null,
                        ]);
                        $story->views_count = max((int) $row->views, 0);
                        $story->likes_count = max((int) $row->likes, 0);
                        $story->created_at = $createdAt;
                        $story->updated_at = $this->legacyDate($row->updated_at) ?? $createdAt;
                        $story->save();
                        $story->tags()->sync($this->legacyTagIds($row->category));
                    });
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Stories migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Stories whose legacy user was missing: {$missingUsers}.");
        $this->console->warn("Stories whose linked post was missing: {$missingPosts}.");
    }

    public function migrateStoryComments(bool $dryRun): void
    {
        $this->console->info('Migrating Story Comments...');

        $query = MigrateHelper::legacy('ad_dad_story_comments');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingStories = 0;
        $missingUsers = 0;
        $missingParents = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingStories,
            &$missingUsers,
            &$missingParents
        ): void {
            $existingIds = Comment::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $stories = Story::query()
                ->whereIn('id', $rows->pluck('story_id'))
                ->pluck('id')
                ->flip();
            $users = User::query()
                ->whereIn('id', $rows->pluck('user_id')->filter())
                ->pluck('id')
                ->flip();
            $parents = Comment::query()
                ->whereIn('id', $rows->pluck('parent_id')->filter(fn ($id) => (int) $id > 0))
                ->get(['id', 'story_id'])
                ->keyBy('id');

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $stories->has($row->story_id)) {
                    $missingStories++;
                    $bar->advance();

                    continue;
                }

                $userId = $users->has($row->user_id) ? (int) $row->user_id : null;
                $parentId = null;

                if ($userId === null) {
                    $missingUsers++;
                }

                if ((int) $row->parent_id > 0) {
                    $parent = $parents->get($row->parent_id);

                    if ($parent && $parent->story_id === (int) $row->story_id) {
                        $parentId = $parent->id;
                    } else {
                        $missingParents++;
                    }
                }

                if ($dryRun) {
                    $this->console->line("Story comment {$row->id} => story {$row->story_id}");
                } else {
                    $createdAt = $this->legacyDate($row->created_at) ?? now();
                    $comment = new Comment;
                    $comment->id = $row->id;
                    $comment->fill([
                        'story_id' => $row->story_id,
                        'user_id' => $userId,
                        'parent_id' => $parentId,
                        'content' => $row->content,
                        'status' => $this->commentStatus($row->status),
                    ]);
                    $comment->likes_count = max((int) $row->likes, 0);
                    $comment->dislikes_count = max((int) $row->dislikes, 0);
                    $comment->created_at = $createdAt;
                    $comment->updated_at = $createdAt;
                    $comment->save();
                    $parents->put($comment->id, $comment);
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Story comments migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Comments skipped because the story was missing: {$missingStories}.");
        $this->console->warn("Comments whose legacy user was missing: {$missingUsers}.");
        $this->console->warn("Replies whose parent was missing or invalid: {$missingParents}.");
    }

    private function blogStatus(?string $status): ContentStatus
    {
        return match ($status) {
            'publish', 'future' => ContentStatus::Published,
            'pending' => ContentStatus::Pending,
            'private', 'trash' => ContentStatus::Archived,
            default => ContentStatus::Draft,
        };
    }

    private function storyStatus(?string $status): ContentStatus
    {
        return match ($status) {
            'submitted', 'pending' => ContentStatus::Pending,
            'approved', 'published' => ContentStatus::Published,
            'rejected' => ContentStatus::Rejected,
            default => ContentStatus::Draft,
        };
    }

    private function commentStatus(?string $status): CommentStatus
    {
        return match ($status) {
            'approved', 'published' => CommentStatus::Approved,
            'rejected' => CommentStatus::Rejected,
            default => CommentStatus::Pending,
        };
    }

    private function questionStatus(?string $status): ?string
    {
        return match ($status) {
            'publish' => 'publish',
            'approved' => 'approved',
            'draft' => 'approved',
            'pending' => 'pending',
            default => null,
        };
    }

    private function questionAnswerStatus(?string $status): ?string
    {
        return match ($status) {
            'approved' => 'approved',
            'rejected' => 'rejected',
            default => null,
        };
    }

    private function legacyDate(mixed $value): ?CarbonImmutable
    {
        if (blank($value) || str_starts_with((string) $value, '0000-00-00')) {
            return null;
        }

        try {
            return CarbonImmutable::parse($value);
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @param  list<string>  $columns
     * @param  list<string>  $candidates
     */
    private function firstExistingColumn(array $columns, array $candidates): ?string
    {
        foreach ($candidates as $candidate) {
            if (in_array($candidate, $columns, true)) {
                return $candidate;
            }
        }

        return null;
    }

    private function legacyColumnValue(object $row, ?string $column): mixed
    {
        if ($column === null || ! property_exists($row, $column)) {
            return null;
        }

        return $row->{$column};
    }

    /** @return list<int> */
    private function legacyTagIds(?string $value): array
    {
        $names = collect(preg_split('/[,،]+/u', $value ?? '') ?: [])
            ->map(fn (string $name) => trim(strip_tags($name)))
            ->filter()
            ->unique()
            ->values();

        return $names->map(function (string $name): int {
            $name = Str::limit($name, 100, '');
            $tag = Tag::withTrashed()->where('name', $name)->first();

            if (! $tag) {
                $tag = Tag::query()->create([
                    'name' => $name,
                    'slug' => $this->slugger()->generate(Tag::class, $name),
                ]);
            }

            return $tag->id;
        })->all();
    }

    private function slugger(): UniqueSlugGenerator
    {
        return app(UniqueSlugGenerator::class);
    }
}
