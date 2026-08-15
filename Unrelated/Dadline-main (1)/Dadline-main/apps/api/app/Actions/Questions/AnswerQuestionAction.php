<?php

namespace App\Actions\Questions;

use App\Enums\QuestionAnswerStatus;
use App\Enums\QuestionStatus;
use App\Enums\WalletTransactionType;
use App\Models\Question;
use App\Models\QuestionAnswer;
use App\Models\User;
use App\Services\Questions\QuestionPricingService;
use App\Services\Wallet\WalletService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AnswerQuestionAction
{
    public function __construct(
        private readonly WalletService $wallets,
        private readonly QuestionPricingService $pricing,
    ) {}

    public function execute(User $provider, string $questionUuid, string $body): QuestionAnswer
    {
        if (! $provider->isLegalProvider()) {
            abort(403);
        }

        return DB::transaction(function () use ($provider, $questionUuid, $body): QuestionAnswer {
            $question = Question::query()
                ->where('uuid', $questionUuid)
                ->lockForUpdate()
                ->firstOrFail();

            if (! in_array($question->status, [QuestionStatus::Approved, QuestionStatus::Publish], true)) {
                throw ValidationException::withMessages([
                    'question' => 'این سوال در حال حاضر قابل پاسخ‌گویی نیست.',
                ]);
            }

            if ($question->user_id === $provider->id) {
                throw ValidationException::withMessages([
                    'question' => 'امکان پاسخ‌گویی به سوال خودتان وجود ندارد.',
                ]);
            }

            $hasCategory = $provider->legalCategories()
                ->whereKey($question->category_id)
                ->exists();

            if (! $hasCategory) {
                abort(403);
            }

            if ($question->answers()->where('vendor_id', $provider->id)->exists()) {
                throw ValidationException::withMessages([
                    'answer' => 'شما قبلاً به این سوال پاسخ داده‌اید.',
                ]);
            }

            $hasApprovedAnswer = $question->answers()
                ->where('status', QuestionAnswerStatus::Approved->value)
                ->exists();

            $answer = $question->answers()->create([
                'vendor_id' => $provider->id,
                'body' => trim(strip_tags($body)),
                'status' => QuestionAnswerStatus::Approved,
            ]);

            if (! $hasApprovedAnswer) {
                $this->wallets->addWithdrawableIncome(
                    user: $provider,
                    amount: $this->pricing->firstAnswerReward(),
                    type: WalletTransactionType::SubmitAnswerOnQuestion,
                    payload: [
                        'question_id' => $question->id,
                        'question_uuid' => $question->uuid,
                        'answer_id' => $answer->id,
                    ],
                );
            }

            return $answer->load(['vendor.vendorProfile', 'vendor.profile.avatar']);
        });
    }
}
