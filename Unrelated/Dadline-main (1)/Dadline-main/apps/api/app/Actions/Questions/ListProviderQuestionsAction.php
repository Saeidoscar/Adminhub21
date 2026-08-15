<?php

namespace App\Actions\Questions;

use App\Enums\QuestionAnswerStatus;
use App\Enums\QuestionStatus;
use App\Models\Question;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListProviderQuestionsAction
{
    public function execute(User $provider, int $perPage = 12): LengthAwarePaginator
    {
        $this->ensureProvider($provider);
        $categoryIds = $provider->legalCategories()->pluck('legal_categories.id');

        return Question::query()
            ->whereIn('category_id', $categoryIds)
            ->where('user_id', '!=', $provider->id)
            ->whereIn('status', [
                QuestionStatus::Approved->value,
                QuestionStatus::Publish->value,
            ])
            ->with([
                'legalCategory',
                'answers' => fn ($query) => $query
                    ->where('status', QuestionAnswerStatus::Approved->value)
                    ->with(['vendor.vendorProfile', 'vendor.profile.avatar'])
                    ->oldest('created_at')
                    ->oldest('id'),
            ])
            ->withCount([
                'answers as approved_answers_count' => fn ($query) => $query
                    ->where('status', QuestionAnswerStatus::Approved->value),
            ])
            ->latest('created_at')
            ->paginate($perPage);
    }

    public function ensureProvider(User $provider): void
    {
        if (! $provider->isLegalProvider()) {
            abort(403, 'این بخش فقط برای وکلا و کارشناسان حقوقی فعال است.');
        }
    }
}
