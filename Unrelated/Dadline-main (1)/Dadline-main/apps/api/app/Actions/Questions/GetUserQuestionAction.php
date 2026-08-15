<?php

namespace App\Actions\Questions;

use App\Enums\QuestionAnswerStatus;
use App\Enums\ReviewType;
use App\Models\Question;
use App\Models\User;

class GetUserQuestionAction
{
    public function execute(User $user, string $uuid): ?Question
    {
        return Question::query()
            ->where('uuid', $uuid)
            ->where('user_id', $user->id)
            ->with([
                'legalCategory',
                'answers' => fn ($query) => $query
                    ->where('status', QuestionAnswerStatus::Approved->value)
                    ->with([
                        'vendor.vendorProfile',
                        'vendor.profile.avatar',
                        'reviews' => fn ($query) => $query
                            ->where('reviewer_id', $user->id)
                            ->where('type', ReviewType::QuestionAnswer->value),
                    ])
                    ->oldest('created_at')
                    ->oldest('id'),
            ])
            ->withCount([
                'answers as approved_answers_count' => fn ($query) => $query
                    ->where('status', QuestionAnswerStatus::Approved->value),
            ])
            ->first();
    }
}
