<?php

namespace App\Http\Controllers\Api\Questions;

use App\Actions\Questions\AnswerQuestionAction;
use App\Actions\Questions\ListProviderQuestionsAction;
use App\Enums\QuestionAnswerStatus;
use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardQuestionAnswerResource;
use App\Http\Resources\DashboardQuestionResource;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProviderQuestionController extends Controller
{
    public function index(Request $request, ListProviderQuestionsAction $action): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'between:1,24'],
        ]);

        return DashboardQuestionResource::collection(
            $action->execute($request->user(), $validated['per_page'] ?? 12)
        );
    }

    public function show(Request $request, string $uuid, ListProviderQuestionsAction $action): DashboardQuestionResource
    {
        $action->ensureProvider($request->user());
        $categoryIds = $request->user()->legalCategories()->pluck('legal_categories.id');

        $question = Question::query()
            ->where('uuid', $uuid)
            ->whereIn('category_id', $categoryIds)
            ->where('user_id', '!=', $request->user()->id)
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
            ->firstOrFail();

        return new DashboardQuestionResource($question);
    }

    public function answer(Request $request, string $uuid, AnswerQuestionAction $action)
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'min:30', 'max:10000'],
        ]);

        $answer = $action->execute($request->user(), $uuid, $validated['body']);

        return (new DashboardQuestionAnswerResource($answer))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
