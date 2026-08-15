<?php

namespace Tests\Unit;

use App\Enums\QuestionAnswerStatus;
use App\Enums\QuestionStatus;
use App\Enums\UserRole;
use App\Jobs\Notifications\AnnounceFirstLegalQuestionAnswerJob;
use App\Models\Notification;
use App\Models\Option;
use App\Models\Question;
use App\Models\QuestionAnswer;
use App\Models\User;
use App\Services\Notifications\DomainNotificationService;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class LegalQuestionAnnouncementJobTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('options', function (Blueprint $table): void {
            $table->id();
            $table->string('group')->default('general');
            $table->string('key')->unique();
            $table->json('value');
            $table->boolean('autoload')->default(false);
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('mobile')->nullable();
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('role');
            $table->boolean('is_vendor')->default(false);
            $table->timestamp('registered_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });

        Schema::create('questions', function (Blueprint $table): void {
            $table->id();
            $table->string('uuid')->nullable();
            $table->foreignId('user_id')->nullable();
            $table->string('title');
            $table->text('body');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->boolean('is_private')->default(false);
            $table->string('slug')->unique();
            $table->string('status');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('answers_question', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('question_id');
            $table->foreignId('vendor_id');
            $table->text('body');
            $table->string('status');
            $table->timestamp('created_at')->nullable();
        });

        Cache::flush();
        Option::set('legal_questions_telegram_enabled', '1', 'notifications');
        Option::set('legal_questions_channel_telegram_chat_id', '-1002303257757', 'notifications');
        Option::set('legal_questions_bale_enabled', '1', 'notifications');
        Option::set('legal_questions_channel_bale_chat_id', '@legal_question', 'notifications');
        Option::set('legal_questions_eitaa_enabled', '1', 'notifications');
        Option::set('legal_questions_channel_eitaaid', '11040164', 'notifications');
        Option::set('legal_questions_public_base_url', 'https://dadline.net/questions', 'notifications');

        Option::set('telegram_bot_enabled', '1', 'notifications');
        Option::set('telegram_bot_relay_enabled', '1', 'notifications');
        Option::set('telegram_bot_relay_url', 'https://relay.test/v1/telegram/sendMessage', 'notifications');
        Option::set('telegram_bot_relay_secret', 'relay-secret', 'notifications');
        Option::set('telegram_bot_proxy_enabled', '0', 'notifications');

        Option::set('bale_bot_enabled', '1', 'notifications');
        Option::set('bale_bot_token', '123456:bale-secret', 'notifications');
        Option::set('bale_bot_api_base_url', 'https://tapi.bale.ai', 'notifications');

        Option::set('eitaa_token_bot', 'eitaa-secret', 'notifications');
        Option::set('eitaa_bot_api_base_url', 'https://eitaayar.ir/api', 'notifications');
    }

    protected function tearDown(): void
    {
        Cache::flush();
        Schema::dropIfExists('answers_question');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('users');
        Schema::dropIfExists('options');

        parent::tearDown();
    }

    public function test_it_announces_the_first_lawyer_answer_to_all_public_channels_once(): void
    {
        [$question, $answer] = $this->createQuestionWithAnswer();

        Http::fake([
            'https://relay.test/*' => Http::response([
                'ok' => true,
                'result' => ['message_id' => 157, 'chat' => ['id' => -1002303257757]],
            ]),
            'https://tapi.bale.ai/bot123456:bale-secret/sendMessage' => Http::response([
                'ok' => true,
                'result' => ['message_id' => 88],
            ]),
            'https://eitaayar.ir/api/eitaa-secret/sendMessage' => Http::response([
                'ok' => true,
                'result' => ['message_id' => 41],
            ]),
        ]);

        $this->runJob($answer);

        Http::assertSentCount(3);
        Http::assertSent(function (Request $request) use ($question): bool {
            if ($request->url() !== 'https://relay.test/v1/telegram/sendMessage') {
                return false;
            }

            return $request['chat_id'] === '-1002303257757'
                && $request['parse_mode'] === 'HTML'
                && str_contains($request['text'], 'فسخ قرارداد اجاره')
                && str_contains($request['text'], 'پاسخ اولیه وکیل')
                && str_contains($request['text'], 'https://dadline.net/questions/'.$question->slug);
        });
        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://tapi.bale.ai/bot123456:bale-secret/sendMessage'
            && $request['chat_id'] === '@legal_question'
            && str_contains($request['text'], 'فسخ قرارداد اجاره')
            && str_contains($request['text'], 'پاسخ اولیه وکیل')
            && str_contains($request['text'], 'https://dadline.net/questions/'.$question->slug)
        );
        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://eitaayar.ir/api/eitaa-secret/sendMessage'
            && $request['chat_id'] === 11040164
            && str_contains($request['text'], 'فسخ قرارداد اجاره')
            && str_contains($request['text'], 'پاسخ اولیه وکیل')
        );

        $this->runJob($answer);
        Http::assertSentCount(3);
    }

    public function test_domain_notification_service_queues_the_announcement_job(): void
    {
        [, $answer] = $this->createQuestionWithAnswer();
        Bus::fake();

        $dispatcher = Mockery::mock(NotificationDispatcher::class);
        $dispatcher->shouldReceive('dispatch')->once()->andReturn(new Notification);

        (new DomainNotificationService($dispatcher))->questionAnswerCreated($answer->fresh());

        Bus::assertDispatched(
            AnnounceFirstLegalQuestionAnswerJob::class,
            fn (AnnounceFirstLegalQuestionAnswerJob $job): bool => $job->answerId === $answer->id,
        );
    }

    public function test_it_does_not_announce_a_later_answer(): void
    {
        [$question] = $this->createQuestionWithAnswer();
        $secondLawyer = $this->createLawyer('مریم', 'محمدی');
        $laterAnswer = QuestionAnswer::withoutEvents(fn () => QuestionAnswer::create([
            'question_id' => $question->id,
            'vendor_id' => $secondLawyer->id,
            'body' => 'پاسخ دوم',
            'status' => QuestionAnswerStatus::Approved,
            'created_at' => now()->addMinute(),
        ]));

        Http::fake();
        $this->runJob($laterAnswer);

        Http::assertNothingSent();
    }

    public function test_retry_only_repeats_the_channel_that_failed_temporarily(): void
    {
        [, $answer] = $this->createQuestionWithAnswer();
        $eitaaAttempts = 0;

        Http::fake(function (Request $request) use (&$eitaaAttempts) {
            if ($request->url() === 'https://relay.test/v1/telegram/sendMessage') {
                return Http::response(['ok' => true, 'result' => ['message_id' => 158]]);
            }

            if ($request->url() === 'https://tapi.bale.ai/bot123456:bale-secret/sendMessage') {
                return Http::response(['ok' => true, 'result' => ['message_id' => 89]]);
            }

            $eitaaAttempts++;

            return $eitaaAttempts === 1
                ? Http::response(['ok' => false, 'error_code' => 503, 'description' => 'Unavailable'], 503)
                : Http::response(['ok' => true, 'result' => ['message_id' => 42]]);
        });

        try {
            $this->runJob($answer);
            $this->fail('The first attempt should be retryable.');
        } catch (RuntimeException) {
            // The queue retries the job.
        }

        $this->runJob($answer);

        Http::assertSentCount(4);
        $this->assertSame(2, $eitaaAttempts);
    }

    /** @return array{Question, QuestionAnswer} */
    private function createQuestionWithAnswer(): array
    {
        $questioner = User::withoutEvents(fn () => User::create([
            'mobile' => '09120000001',
            'first_name' => 'کاربر',
            'last_name' => 'دادلاین',
            'role' => UserRole::USER,
        ]));
        $lawyer = $this->createLawyer('علی', 'احمدی');
        $question = Question::withoutEvents(fn () => Question::create([
            'user_id' => $questioner->id,
            'title' => 'فسخ قرارداد اجاره',
            'body' => 'برای فسخ قرارداد اجاره چه شرایطی لازم است؟',
            'is_private' => false,
            'slug' => 'terminate-rental-contract',
            'status' => QuestionStatus::Publish,
            'created_at' => now(),
        ]));
        $answer = QuestionAnswer::withoutEvents(fn () => QuestionAnswer::create([
            'question_id' => $question->id,
            'vendor_id' => $lawyer->id,
            'body' => 'پاسخ اولیه وکیل درباره شرایط قانونی فسخ قرارداد.',
            'status' => QuestionAnswerStatus::Approved,
            'created_at' => now(),
        ]));

        return [$question, $answer];
    }

    private function createLawyer(string $firstName, string $lastName): User
    {
        return User::withoutEvents(fn () => User::create([
            'mobile' => '0935'.str_pad((string) User::query()->count(), 7, '0', STR_PAD_LEFT),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'role' => UserRole::LAWYER_BONYAD,
            'is_vendor' => true,
        ]));
    }

    private function runJob(QuestionAnswer $answer): void
    {
        app()->call([new AnnounceFirstLegalQuestionAnswerJob($answer->id), 'handle']);
    }
}
