<?php

namespace App\Http\Controllers\Api\Web\Public;

use App\Actions\Questions\GetPublicQuestionAction;
use App\Actions\Questions\ListPublicQuestionsAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\PublicQuestionResource;
use Illuminate\Http\Request;

class PublicQuestionController extends Controller
{
    public function index(Request $request, ListPublicQuestionsAction $action)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:191'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'between:1,24'],
        ]);

        return PublicQuestionResource::collection($action->handle($validated));
    }

    public function show(string $slug, GetPublicQuestionAction $action)
    {
        $question = $action->handle($slug);

        abort_if($question === null, 404);

        return new PublicQuestionResource($question);
    }
}
