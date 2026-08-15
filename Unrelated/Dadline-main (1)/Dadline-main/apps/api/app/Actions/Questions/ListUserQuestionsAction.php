<?php

namespace App\Actions\Questions;

use App\Enums\QuestionAnswerStatus;
use App\Models\Question;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListUserQuestionsAction
{
    public function execute(User $user, int $perPage = 12): LengthAwarePaginator
    {
        return Question::query()
            ->where('user_id', $user->id)
            ->with('legalCategory')
            ->withCount([
                'answers as approved_answers_count' => fn ($query) => $query
                    ->where('status', QuestionAnswerStatus::Approved->value),
            ])
            ->latest('created_at')
            ->paginate($perPage);
    }
}
