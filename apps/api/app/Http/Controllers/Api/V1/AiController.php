<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Ai\CreateConversationAction;
use App\Actions\Ai\SendMessageAction;
use App\Actions\Ai\TrackTokensAction;
use App\Actions\Ai\ManageModelsAction;
use App\Services\Ai\AiService;
use App\Models\AiConversation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(
        private readonly AiService $aiService,
    ) {}

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
            $conversation = \App\Models\AiConversation::query()->findOrFail($conversationId);
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
            'model_id' => ['required', 'integer', 'exists:ai_models,id'],
        ]);

        return response()->json(['message' => 'Analysis queued']);
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

    public function trackTokens(Request $request, \App\Models\AiMessage $message): JsonResponse
    {
        $message = $this->aiService->trackTokens($message, $request->validate([
            'in_tokens' => ['required', 'integer', 'min:0'],
            'out_tokens' => ['required', 'integer', 'min:0'],
        ]));

        return response()->json($message);
    }
}
