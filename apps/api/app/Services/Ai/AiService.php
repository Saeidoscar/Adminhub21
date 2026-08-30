<?php

namespace App\Services\Ai;

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\User;
use App\Actions\Ai\CreateConversationAction;
use App\Actions\Ai\SendMessageAction;
use App\Actions\Ai\TrackTokensAction;
use App\Actions\Ai\ManageModelsAction;
use App\Services\Ai\AIProviderFactory;
use App\Services\Ai\Providers\AIProviderInterface;
use Illuminate\Support\Facades\DB;

class AiService
{
    public function __construct(
        private readonly CreateConversationAction $createConversation,
        private readonly SendMessageAction $sendMessage,
        private readonly TrackTokensAction $trackTokens,
        private readonly ManageModelsAction $manageModels,
        private readonly AIProviderFactory $providerFactory,
    ) {}

    public function createConversation(User $user, array $data): AiConversation
    {
        return $this->createConversation->execute($user, $data);
    }

    public function sendMessage(AiConversation $conversation, array $data): AiMessage
    {
        $provider = $this->resolveProvider($conversation);

        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->get(['prompt', 'response'])
            ->map(fn ($m) => ['role' => 'user', 'content' => $m->prompt])
            ->toArray();

        $messages[] = ['role' => 'user', 'content' => $data['prompt']];

        $result = $provider->chat($messages, [
            'model' => $conversation->model?->code ?? 'gpt-4o-mini',
        ]);

        return DB::transaction(function () use ($conversation, $data, $result): AiMessage {
            return $conversation->messages()->create([
                'prompt' => $data['prompt'],
                'response' => $result['content'],
                'in_tokens' => $result['usage']['prompt_tokens'] ?? null,
                'out_tokens' => $result['usage']['completion_tokens'] ?? null,
                'provider' => $result['provider'] ?? null,
                'model_code' => $result['model_code'] ?? null,
            ]);
        });
    }

    public function trackTokens(AiMessage $message, array $usage): AiMessage
    {
        return $this->trackTokens->execute($message, $usage);
    }

    public function manageModel(?object $model, array $data): \App\Models\AiModel
    {
        return $this->manageModels->execute($model, $data);
    }

    public function analyze(string $text, array $options = []): array
    {
        $providerName = $options['provider'] ?? 'openai';
        $provider = $this->providerFactory->make($providerName);

        return $provider->analyze($text, $options);
    }

    private function resolveProvider(AiConversation $conversation): AIProviderInterface
    {
        $providerName = $conversation->model?->provider ?? 'openai';

        return $this->providerFactory->make($providerName);
    }
}
