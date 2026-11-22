<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AiModelResource;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\AiModel;
use App\Services\Ai\AiBillingService;
use App\Services\Ai\AIProviderFactory;
use App\Services\Ai\AiService;
use App\Services\Ai\Guardrails\TrialGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AiController extends Controller
{
    public function __construct(
        private readonly AiService $aiService,
        private readonly AiBillingService $billing,
    ) {}

    public function models(Request $request): JsonResponse
    {
        $models = AiModel::query()->get();

        return response()->json([
            'models' => AiModelResource::collection($models)->resolve($request),
            'billing' => [
                'currency' => 'TOMAN',
                'usd_to_toman' => $this->billing->usdToToman(),
                'markup_rate' => $this->billing->markupRate(),
                'free_allowance' => config('ai.free_allowance'),
            ],
        ]);
    }

    /**
     * Which providers this deployment can route to, plus configuration state
     * and the LayerCloud training-circle fence. Deliberately reports flags and
     * counts only — never API keys or prompt content.
     */
    public function providers(Request $request, TrialGuard $guard): JsonResponse
    {
        $layercloud = [
            'enabled' => (bool) config('services.layercloud.enabled', false),
            'trial_only' => (bool) config('services.layercloud.trial_only', true),
            'default_model' => config('services.layercloud.default_model'),
            'free_models' => $guard->allowedModels(),
            'budget' => $guard->snapshot(),
        ];

        $user = $request->user();

        return response()->json([
            'providers' => AIProviderFactory::supported(),
            'default_provider' => config('ai.default_provider'),
            'arvancloud' => [
                'configured' => trim((string) config('services.arvancloud.api_key', '')) !== '',
                'base_url' => config('services.arvancloud.base_url'),
                'default_model' => config('services.arvancloud.default_model'),
            ],
            'avalai' => [
                'configured' => trim((string) config('services.avalai.api_key', '')) !== '',
                'base_url' => config('services.avalai.base_url'),
                'default_model' => config('services.avalai.default_model'),
            ],
            'layercloud' => $layercloud,
            'billing' => [
                'currency' => 'TOMAN',
                'usd_to_toman' => $this->billing->usdToToman(),
                'markup_rate' => $this->billing->markupRate(),
                'free_daily_tokens' => (int) config('ai.free_allowance.daily_tokens', 25000),
                'free_tokens_used_today' => $user !== null ? $this->billing->freeTokensUsedToday($user) : 0,
            ],
            'tasks' => array_keys((array) config('ai.tasks', [])),
        ]);
    }

    public function showConversation(Request $request, AiConversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);

        return response()->json(['conversation' => $conversation->load('model', 'messages')]);
    }

    public function updateConversation(Request $request, AiConversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $conversation->update($validated);

        return response()->json(['conversation' => $conversation]);
    }

    public function destroyConversation(Request $request, AiConversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);

        $conversation->delete();

        return response()->json(null, 204);
    }

    public function switchModel(Request $request, AiConversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);

        $validated = $request->validate([
            'model_id' => ['required', 'integer', 'exists:ai_models,id'],
        ]);

        $conversation->update(['model_id' => $validated['model_id']]);

        return response()->json(['conversation' => $conversation->load('model')]);
    }

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => ['required', 'string'],
            'model_id' => ['nullable', 'integer', 'exists:ai_models,id'],
            'conversation_id' => ['nullable', 'integer', 'exists:ai_conversations,id'],
            'task' => ['nullable', 'string', Rule::in(array_keys((array) config('ai.tasks', [])))],
            'max_tokens' => ['nullable', 'integer', 'min:1'],
        ]);

        if (! isset($validated['conversation_id'])) {
            $conversation = $this->aiService->createConversation($request->user(), [
                'type' => $validated['task'] ?? 'marketplace_help',
                'model_id' => $validated['model_id'] ?? null,
            ]);
        } else {
            $conversation = AiConversation::query()->findOrFail($validated['conversation_id']);
            $this->authorizeConversation($request, $conversation);
        }

        $message = $this->aiService->sendMessage($conversation, [
            'prompt' => $validated['prompt'],
            'task' => $validated['task'] ?? null,
            'max_tokens' => $validated['max_tokens'] ?? null,
        ]);

        return response()->json($message, 201);
    }

    public function analyze(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => ['required', 'string'],
            'model_id' => ['nullable', 'integer', 'exists:ai_models,id'],
            'provider' => ['nullable', 'string', Rule::in(AIProviderFactory::supported())],
            'task' => ['nullable', 'string', Rule::in(array_keys((array) config('ai.tasks', [])))],
            'max_tokens' => ['nullable', 'integer', 'min:1'],
        ]);

        $result = $this->aiService->analyze(
            $validated['text'],
            array_filter([
                'provider' => $validated['provider'] ?? null,
                'model_id' => $validated['model_id'] ?? null,
                'task' => $validated['task'] ?? null,
                'max_tokens' => $validated['max_tokens'] ?? null,
            ], static fn (mixed $v): bool => $v !== null),
            $request->user(),
        );

        return response()->json($result);
    }

    public function history(Request $request, ?AiConversation $conversation = null): JsonResponse
    {
        if ($conversation !== null) {
            $this->authorizeConversation($request, $conversation);

            return response()->json([
                'messages' => $conversation->messages()->orderBy('created_at')->get(),
            ]);
        }

        $conversations = AiConversation::query()
            ->where('user_id', $request->user()->id)
            ->with(['model', 'messages'])
            ->paginate();

        return response()->json($conversations);
    }

    public function clearHistory(Request $request): JsonResponse
    {
        AiConversation::query()->where('user_id', $request->user()->id)->delete();

        return response()->json(null, 204);
    }

    public function conversations(Request $request): JsonResponse
    {
        $conversations = AiConversation::query()
            ->where('user_id', $request->user()->id)
            ->with(['model', 'messages'])
            ->paginate();

        return response()->json($conversations);
    }

    public function storeConversation(Request $request): JsonResponse
    {
        $conversation = $this->aiService->createConversation($request->user(), $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'string'],
            'model_id' => ['nullable', 'integer', 'exists:ai_models,id'],
        ]));

        return response()->json($conversation, 201);
    }

    public function sendMessage(Request $request, AiConversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);

        $message = $this->aiService->sendMessage($conversation, $request->validate([
            'prompt' => ['required', 'string'],
            'task' => ['nullable', 'string', Rule::in(array_keys((array) config('ai.tasks', [])))],
            'max_tokens' => ['nullable', 'integer', 'min:1'],
            'response' => ['nullable', 'string'],
            'in_tokens' => ['nullable', 'integer'],
            'out_tokens' => ['nullable', 'integer'],
        ]));

        return response()->json($message, 201);
    }

    public function trackTokens(Request $request, AiMessage $message): JsonResponse
    {
        $message->loadMissing('conversation');
        abort_unless($message->conversation?->user_id === $request->user()->id, 403);

        $message = $this->aiService->trackTokens($message, $request->validate([
            'in_tokens' => ['required', 'integer', 'min:0'],
            'out_tokens' => ['required', 'integer', 'min:0'],
        ]));

        return response()->json($message);
    }

    private function authorizeConversation(Request $request, AiConversation $conversation): void
    {
        abort_unless($conversation->user_id === $request->user()->id, 403);
    }
}
