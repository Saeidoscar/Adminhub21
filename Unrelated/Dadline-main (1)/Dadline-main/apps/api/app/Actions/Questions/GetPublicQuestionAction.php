<?php

namespace App\Actions\Questions;

use App\Enums\QuestionAnswerStatus;
use App\Enums\QuestionStatus;
use App\Models\Question;

class GetPublicQuestionAction
{
    public function handle(string $slug): ?Question
    {
        return Question::query()
            ->where('slug', $slug)
            ->where('is_private', false)
            ->whereIn('status', [
                QuestionStatus::Approved->value,
                QuestionStatus::Publish->value,
            ])
            ->with([
                'legalCategory',
                'user',
                'answers' => fn ($query) => $query
                    ->where('status', QuestionAnswerStatus::Approved->value)
                    ->with([
                        'vendor' => fn ($query) => $query
                            ->with(['vendorProfile', 'profile.avatar'])
                            ->withAvg([
                                'reviewsReceived as approved_reviews_avg_rate' => fn ($query) => $query
                                    ->where('status', 'approved'),
                            ], 'rate')
                            ->withCount([
                                'reviewsReceived as approved_reviews_count' => fn ($query) => $query
                                    ->where('status', 'approved'),
                            ]),
                    ])
                    ->latest('created_at'),
            ])
            ->withCount([
                'answers as approved_answers_count' => fn ($query) => $query
                    ->where('status', QuestionAnswerStatus::Approved->value),
            ])
            ->first();
    }
}
