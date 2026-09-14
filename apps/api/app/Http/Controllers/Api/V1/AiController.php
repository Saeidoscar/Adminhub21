<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\AiModel;
use App\Services\Ai\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(
        private readonly AiService $aiService,
    ) {}

    public function models(Request $request): JsonResponse
    {
        $models = AiModel::query()->get();

        return response()->json(['models' => $models]);
    }

    public function showConversation(Request $request, AiConversation $conversation): JsonResponse
    {
        return response()->json(['conversation' => $conversation->load('model', 'messages')]);
    }

    public function updateConversation(Request $request, AiConversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $conversation->update($validated);

        return response()->json(['conversation' => $conversation]);
    }

    public function destroyConversation(Request $request, AiConversation $conversation): JsonResponse
    {
        $conversation->delete();

        return response()->json(null, 204);
    }

    public function switchModel(Request $request, AiConversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'model_id' => ['required', 'integer', 'exists:ai_models,id'],
        ]);

        $conversation->update(['model_id' => $validated['model_id']]);

        return response()->json(['conversation' => $conversation->load('model')]);
    }

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => ['required', 'string'],
            'model_id' => ['required', 'integer', 'exists:ai_models,id'],
            'conversation_id' => ['nullable', 'integer', 'exists:ai_conversations,id'],
        ]);

        $conversationId = $request->conversation_id;
        if ($conversationId === null) {
            $conversation = $this->aiService->createConversation($request->user(), [
                'type' => 'marketplace_help',
                'model_id' => $request->model_id,
            ]);
        } else {
            $conversation = AiConversation::query()->findOrFail($conversationId);
        }

        $message = $this->aiService->sendMessage($conversation, [
            'prompt' => $request->prompt,
        ]);

        return response()->json($message, 201);
    }

    public function analyze(Request $request): JsonResponse
    {
        $request->validate([
            'text' => ['required', 'string'],
            'model_id' => ['nullable', 'integer', 'exists:ai_models,id'],
            'provider' => ['nullable', 'string', 'in:openai,anthropic,openrouter'],
        ]);

        $result = $this->aiService->analyze($request->text, [
            'provider' => $request->provider ?? 'openai',
        ]);

        return response()->json($result);
    }

    public function history(Request $request): JsonResponse
    {
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
            'model_id' => ['required', 'integer', 'exists:ai_models,id'],
        ]));

        return response()->json($conversation, 201);
    }

    public function sendMessage(Request $request, AiConversation $conversation): JsonResponse
    {
        $message = $this->aiService->sendMessage($conversation, $request->validate([
            'prompt' => ['required', 'string'],
            'response' => ['nullable', 'string'],
            'in_tokens' => ['nullable', 'integer'],
            'out_tokens' => ['nullable', 'integer'],
        ]));

        return response()->json($message, 201);
    }

    public function trackTokens(Request $request, AiMessage $message): JsonResponse
    {
        $message = $this->aiService->trackTokens($message, $request->validate([
            'in_tokens' => ['required', 'integer', 'min:0'],
            'out_tokens' => ['required', 'integer', 'min:0'],
        ]));

        return response()->json($message);
    }
}
