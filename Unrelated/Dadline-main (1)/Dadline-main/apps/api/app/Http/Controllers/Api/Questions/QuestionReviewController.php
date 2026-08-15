<?php

namespace App\Http\Controllers\Api\Questions;

use App\Actions\Questions\CreateQuestionAnswerReviewAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Question;
use App\Models\QuestionAnswer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class QuestionReviewController extends Controller
{
    public function store(
        Request $request,
        string $uuid,
        int $answerId,
        CreateQuestionAnswerReviewAction $action,
    ) {
        $validated = $request->validate([
            'rate' => ['required', 'integer', 'between:1,5'],
            'review' => ['required', 'string', 'min:3', 'max:2000'],
        ]);

        $question = Question::query()->where('uuid', $uuid)->firstOrFail();
        $answer = QuestionAnswer::query()->findOrFail($answerId);
        $existing = $answer->reviews()
            ->where('reviewer_id', $request->user()->id)
            ->exists();

        $review = $action->execute($request->user(), $question, $answer, $validated);

        return (new ReviewResource($review))
            ->response()
            ->setStatusCode($existing ? Response::HTTP_OK : Response::HTTP_CREATED);
    }
}
