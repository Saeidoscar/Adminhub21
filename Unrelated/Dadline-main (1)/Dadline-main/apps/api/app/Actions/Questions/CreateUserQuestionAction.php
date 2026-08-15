<?php

namespace App\Actions\Questions;

use App\Enums\QuestionStatus;
use App\Enums\WalletTransactionType;
use App\Models\Question;
use App\Models\User;
use App\Services\Questions\QuestionPricingService;
use App\Services\Wallet\WalletService;
use App\Support\UniqueSlugGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateUserQuestionAction
{
    public function __construct(
        private readonly WalletService $wallets,
        private readonly QuestionPricingService $pricing,
        private readonly UniqueSlugGenerator $slugs,
    ) {}

    /** @param array{title:string, category_id:int, body:string, is_private:bool} $data */
    public function execute(User $user, array $data): Question
    {
        return DB::transaction(function () use ($user, $data): Question {
            $isPrivate = (bool) $data['is_private'];
            $fee = $this->pricing->price($isPrivate);
            $uuid = (string) Str::uuid();
            $title = Str::squish(strip_tags($data['title']));
            $body = trim(strip_tags($data['body']));

            $question = Question::query()->create([
                'uuid' => $uuid,
                'user_id' => $user->id,
                'title' => $title,
                'body' => $body,
                'category_id' => $data['category_id'],
                'is_private' => $isPrivate,
                'slug' => $this->slugs->generate(Question::class, $title),
                'status' => $isPrivate
                    ? QuestionStatus::Approved
                    : QuestionStatus::Publish,
            ]);

            $this->wallets->ensureWallet($user);
            $this->wallets->withdrawForPurchase(
                user: $user,
                amount: $fee,
                type: WalletTransactionType::SubmitQuestion,
                payload: [
                    'question_id' => $question->id,
                    'question_uuid' => $question->uuid,
                    'is_private' => $isPrivate,
                    'base_price' => $this->pricing->basePrice(),
                    'private_surcharge_percent' => $isPrivate
                        ? QuestionPricingService::PRIVATE_SURCHARGE_PERCENT
                        : 0,
                ],
            );

            return $question->load(['legalCategory', 'answers']);
        });
    }
}
