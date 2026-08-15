<?php

namespace App\Http\Controllers\Api\Questions;

use App\Actions\Questions\CreateUserQuestionAction;
use App\Actions\Questions\GetUserQuestionAction;
use App\Actions\Questions\ListUserQuestionsAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardQuestionResource;
use App\Models\LegalCategory;
use App\Services\Questions\QuestionPricingService;
use App\Services\Wallet\WalletService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class UserQuestionController extends Controller
{
    public function index(Request $request, ListUserQuestionsAction $action): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'between:1,24'],
        ]);

        return DashboardQuestionResource::collection(
            $action->execute($request->user(), $validated['per_page'] ?? 12)
        );
    }

    public function meta(
        Request $request,
        QuestionPricingService $pricing,
        WalletService $wallets,
    ): array {
        $wallet = $wallets->ensureWallet($request->user())->refresh();

        return [
            'data' => [
                'categories' => LegalCategory::query()
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug']),
                'pricing' => $pricing->payload(),
                'walletBalance' => $wallets->spendableBalance($wallet),
            ],
        ];
    }

    public function store(Request $request, CreateUserQuestionAction $action)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'min:8', 'max:180'],
            'category_id' => ['required', 'integer', 'exists:legal_categories,id'],
            'body' => ['required', 'string', 'min:30', 'max:10000'],
            'is_private' => ['required', 'boolean'],
        ]);

        $question = $action->execute($request->user(), $validated);

        return (new DashboardQuestionResource($question))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, string $uuid, GetUserQuestionAction $action): DashboardQuestionResource
    {
        $question = $action->execute($request->user(), $uuid);

        abort_if($question === null, 404);

        return new DashboardQuestionResource($question);
    }
}
