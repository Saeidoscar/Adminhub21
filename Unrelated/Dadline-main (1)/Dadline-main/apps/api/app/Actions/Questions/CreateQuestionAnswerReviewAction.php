<?php

namespace App\Actions\Questions;

use App\Actions\Reviews\UpsertServiceReviewAction;
use App\Enums\QuestionAnswerStatus;
use App\Enums\ReviewType;
use App\Models\Question;
use App\Models\QuestionAnswer;
use App\Models\Review;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CreateQuestionAnswerReviewAction
{
    public function __construct(
        private readonly UpsertServiceReviewAction $reviews,
    ) {}

    /** @param array{rate:int, review:string} $data */
    public function execute(User $user, Question $question, QuestionAnswer $answer, array $data): Review
    {
        if ($question->user_id !== $user->id || $answer->question_id !== $question->id) {
            abort(403);
        }

        if ($answer->status !== QuestionAnswerStatus::Approved) {
            throw ValidationException::withMessages([
                'answer' => 'برای این پاسخ امکان ثبت دیدگاه وجود ندارد.',
            ]);
        }

        $answer->loadMissing('vendor');
        abort_if($answer->vendor === null, 404);

        return $this->reviews->execute(
            reviewer: $user,
            vendor: $answer->vendor,
            type: ReviewType::QuestionAnswer,
            itemId: $answer->id,
            rate: $data['rate'],
            review: $data['review'],
        );
    }
}
