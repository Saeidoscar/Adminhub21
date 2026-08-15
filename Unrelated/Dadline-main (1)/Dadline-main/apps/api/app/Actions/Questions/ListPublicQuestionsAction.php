<?php

namespace App\Actions\Questions;

use App\Enums\QuestionAnswerStatus;
use App\Enums\QuestionStatus;
use App\Models\Question;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListPublicQuestionsAction
{
    public function handle(array $filters): LengthAwarePaginator
    {
        return Question::query()
            ->where('is_private', false)
            ->whereIn('status', [
                QuestionStatus::Approved->value,
                QuestionStatus::Publish->value,
            ])
            ->whereNotNull('slug')
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query
                        ->where('title', 'ILIKE', "%{$search}%")
                        ->orWhere('body', 'ILIKE', "%{$search}%");
                });
            })
            ->when($filters['category'] ?? null, function (Builder $query, string $category) {
                $query->whereHas(
                    'legalCategory',
                    fn ($query) => $query->where('slug', $category)
                );
            })
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
            ->latest('created_at')
            ->paginate($filters['per_page'] ?? 12);
    }
}
