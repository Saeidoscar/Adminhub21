<?php

namespace Tests\Feature;

use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionType;
use App\Models\LegalCategory;
use App\Models\Option;
use App\Models\Question;
use App\Models\Review;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Notifications\DomainNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LegalQuestionsDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mock(DomainNotificationService::class)->shouldIgnoreMissing();
        Option::set('submit_question', 19_800, 'wallet');
        Option::set('first_answer_on_question_cost', 8_000, 'wallet');
    }

    public function test_user_can_create_a_public_question_and_the_configured_cost_is_deducted(): void
    {
        $user = $this->createUser('09120000001');
        $this->createWallet($user, 100_000);
        $category = LegalCategory::query()->where('slug', 'family')->firstOrFail();
        Sanctum::actingAs($user);

        $response = $this->postJson('/v1/questions', [
            'title' => 'برای مطالبه مهریه از کجا شروع کنم',
            'category_id' => $category->id,
            'body' => 'برای مطالبه مهریه با توجه به شرایط فعلی و مدارکی که در اختیار دارم چه مراحلی را باید انجام دهم؟',
            'is_private' => false,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.isPrivate', false)
            ->assertJsonPath('data.status', 'publish')
            ->assertJsonPath('data.category.id', $category->id);

        $question = Question::query()->sole();

        $this->assertSame('برای-مطالبه-مهریه-از-کجا-شروع-کنم', $question->slug);
        $this->assertSame(80_200, $user->wallet()->value('balance'));
        $transaction = WalletTransaction::query()
            ->where('user_id', $user->id)
            ->where('amount', 19_800)
            ->where('direction', WalletTransactionDirection::Withdrawal->value)
            ->where('type', WalletTransactionType::SubmitQuestion->value)
            ->where('status', 'completed')
            ->sole();

        $this->assertSame($question->id, $transaction->payload['question_id']);
        $this->assertSame($question->uuid, $transaction->payload['question_uuid']);

        $this->getJson("/v1/questions/{$question->slug}")
            ->assertOk()
            ->assertJsonPath('data.title', $question->title);
    }

    public function test_private_question_costs_thirty_percent_more_and_is_not_publicly_accessible(): void
    {
        $user = $this->createUser('09120000002');
        $this->createWallet($user, 100_000);
        $category = LegalCategory::query()->where('slug', 'civil')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/v1/questions', [
            'title' => 'بررسی خصوصی اختلاف مربوط به قرارداد',
            'category_id' => $category->id,
            'body' => 'برای یک اختلاف قراردادی خصوصی نیاز دارم جزئیات پرونده فقط در اختیار وکلای مرتبط قرار بگیرد و عمومی نشود.',
            'is_private' => true,
        ])->assertCreated()
            ->assertJsonPath('data.isPrivate', true)
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.slug', null);

        $question = Question::query()->sole();

        $this->assertSame(74_260, $user->wallet()->value('balance'));
        $this->getJson("/v1/questions/{$question->slug}")->assertNotFound();
    }

    public function test_only_matching_legal_providers_can_see_and_answer_a_question(): void
    {
        $owner = $this->createUser('09120000003');
        $this->createWallet($owner, 100_000);
        $family = LegalCategory::query()->where('slug', 'family')->firstOrFail();
        $criminal = LegalCategory::query()->where('slug', 'criminal')->firstOrFail();
        $question = $this->createQuestionThroughApi($owner, $family->id, true);

        $matchingProvider = $this->createProvider('09120000004', $family->id);
        $otherProvider = $this->createProvider('09120000005', $criminal->id);

        Sanctum::actingAs($matchingProvider);
        $this->getJson('/v1/questions/provider')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.uuid', $question->uuid)
            ->assertJsonPath('data.0.isPrivate', true);

        Sanctum::actingAs($otherProvider);
        $this->getJson('/v1/questions/provider')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->postJson("/v1/questions/provider/{$question->uuid}/answers", [
            'body' => 'این پاسخ به دلیل نداشتن دسته‌بندی مرتبط نباید در سامانه ثبت شود و دسترسی باید رد شود.',
        ])->assertForbidden();
    }

    public function test_only_the_first_provider_answer_receives_the_configured_withdrawable_income(): void
    {
        $owner = $this->createUser('09120000006');
        $this->createWallet($owner, 100_000);
        $category = LegalCategory::query()->where('slug', 'commercial')->firstOrFail();
        $question = $this->createQuestionThroughApi($owner, $category->id, false);
        $firstProvider = $this->createProvider('09120000007', $category->id);
        $secondProvider = $this->createProvider('09120000008', $category->id);

        Sanctum::actingAs($firstProvider);
        $firstResponse = $this->postJson("/v1/questions/provider/{$question->uuid}/answers", [
            'body' => 'با توجه به موضوع تجاری مطرح‌شده، ابتدا اسناد قرارداد و تعهدات طرفین را بررسی و سپس اظهارنامه رسمی ارسال کنید.',
        ])->assertCreated();

        Sanctum::actingAs($secondProvider);
        $this->postJson("/v1/questions/provider/{$question->uuid}/answers", [
            'body' => 'راهکار دیگر این است که پیش از طرح دعوا، مدارک پرداخت و مکاتبات تجاری را دسته‌بندی و ادله خود را تکمیل کنید.',
        ])->assertCreated();

        $rewardTransaction = WalletTransaction::query()
            ->where('type', WalletTransactionType::SubmitAnswerOnQuestion->value)
            ->where('direction', WalletTransactionDirection::Deposit->value)
            ->sole();

        $this->assertSame($firstResponse->json('data.id'), $rewardTransaction->payload['answer_id']);
        $this->assertSame($question->id, $rewardTransaction->payload['question_id']);
        $this->assertSame(8_000, $rewardTransaction->amount);
        $this->assertSame($firstProvider->id, $rewardTransaction->user_id);
        $this->assertSame(8_000, $firstProvider->wallet()->value('balance'));
        $this->assertSame(8_000, $firstProvider->wallet()->value('withdrawable_balance'));
        $this->assertSame(0, $secondProvider->wallet()->value('balance'));
        $this->assertSame(1, WalletTransaction::query()
            ->where('type', WalletTransactionType::SubmitAnswerOnQuestion->value)
            ->where('direction', WalletTransactionDirection::Deposit->value)
            ->count());
    }

    public function test_question_owner_can_create_and_update_one_review_for_each_answer(): void
    {
        $owner = $this->createUser('09120000009');
        $this->createWallet($owner, 100_000);
        $category = LegalCategory::query()->where('slug', 'tax')->firstOrFail();
        $question = $this->createQuestionThroughApi($owner, $category->id, false);
        $provider = $this->createProvider('09120000010', $category->id);

        Sanctum::actingAs($provider);
        $answerId = $this->postJson("/v1/questions/provider/{$question->uuid}/answers", [
            'body' => 'برای موضوع مالیاتی ابتدا برگ تشخیص و مهلت اعتراض را بررسی کنید و مستندات هزینه‌ها را به‌صورت منظم ارائه دهید.',
        ])->assertCreated()->json('data.id');

        Sanctum::actingAs($owner);
        $this->postJson("/v1/questions/me/{$question->uuid}/answers/{$answerId}/review", [
            'rate' => 5,
            'review' => 'پاسخ دقیق و کاربردی بود.',
        ])->assertCreated()
            ->assertJsonPath('data.rating', 5);

        $this->postJson("/v1/questions/me/{$question->uuid}/answers/{$answerId}/review", [
            'rate' => 4,
            'review' => 'پس از بررسی دوباره، پاسخ خوب و قابل استفاده بود.',
        ])->assertOk()
            ->assertJsonPath('data.rating', 4);

        $this->assertSame(1, Review::query()->count());
        $this->assertDatabaseHas('reviews', [
            'reviewer_id' => $owner->id,
            'vendor_id' => $provider->id,
            'type' => 'q_answer',
            'item_id' => $answerId,
            'rate' => 4,
        ]);

        $unrelatedUser = $this->createUser('09120000011');
        Sanctum::actingAs($unrelatedUser);
        $this->postJson("/v1/questions/me/{$question->uuid}/answers/{$answerId}/review", [
            'rate' => 5,
            'review' => 'این کاربر مالک سؤال نیست.',
        ])->assertForbidden();
    }

    private function createQuestionThroughApi(User $owner, int $categoryId, bool $isPrivate): Question
    {
        Sanctum::actingAs($owner);

        $uuid = $this->postJson('/v1/questions', [
            'title' => 'عنوان کامل پرسش حقوقی برای تست سامانه',
            'category_id' => $categoryId,
            'body' => 'این متن برای ایجاد یک پرسش حقوقی کامل در تست نوشته شده است و جزئیات لازم را برای ثبت سؤال دارد.',
            'is_private' => $isPrivate,
        ])->assertCreated()->json('data.uuid');

        return Question::query()->where('uuid', $uuid)->firstOrFail();
    }

    private function createUser(string $mobile): User
    {
        return User::query()->create([
            'mobile' => $mobile,
            'first_name' => 'کاربر',
            'last_name' => substr($mobile, -2),
            'role' => 'user',
        ]);
    }

    private function createProvider(string $mobile, int $categoryId): User
    {
        $provider = User::query()->create([
            'mobile' => $mobile,
            'first_name' => 'وکیل',
            'last_name' => substr($mobile, -2),
            'role' => 'lawyer_judicial',
            'is_vendor' => true,
        ]);

        $provider->legalCategories()->attach($categoryId);
        $this->createWallet($provider, 0);

        return $provider;
    }

    private function createWallet(User $user, int $balance): Wallet
    {
        return Wallet::query()->create([
            'user_id' => $user->id,
            'balance' => $balance,
            'blocked_balance' => $balance,
            'withdrawable_balance' => 0,
        ]);
    }
}
