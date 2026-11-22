<?php

namespace App\Services\Ai;

use App\Actions\Ai\CreateConversationAction;
use App\Actions\Ai\ManageModelsAction;
use App\Actions\Ai\TrackTokensAction;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\AiModel;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AiService
{
    public function __construct(
        private readonly CreateConversationAction $createConversation,
        private readonly TrackTokensAction $trackTokens,
        private readonly ManageModelsAction $manageModels,
        private readonly AIProviderFactory $providerFactory,
        private readonly AiTaskRouter $taskRouter,
        private readonly AiBillingService $billing,
    ) {}

    public function createConversation(User $user, array $data): AiConversation
    {
        $task = $this->taskRouter->normalizeTask($data['type'] ?? null);
        $data['type'] = $task;

        $requestedModel = isset($data['model_id'])
            ? AiModel::query()->find($data['model_id'])
            : null;

        $resolvedModel = $this->taskRouter->resolveModel($task, $requestedModel);

        if ($resolvedModel === null) {
            throw ValidationException::withMessages([
                'model_id' => ['No active AI model is available for this task.'],
            ]);
        }

        $data['model_id'] = $resolvedModel->id;

        return $this->createConversation->execute($user, $data);
    }

    /**
     * Execute one AI conversation turn with task routing, output caps,
     * pre-flight wallet/allowance authorization and atomic settlement.
     *
     * @param array<string, mixed> $data
     */
    public function sendMessage(AiConversation $conversation, array $data): AiMessage
    {
        $conversation->loadMissing('model', 'user');

        $task = $this->taskRouter->normalizeTask($data['task'] ?? $conversation->type);
        $model = $this->taskRouter->resolveModel($task, $conversation->model);
        $providerName = $model?->provider ?? (string) config('ai.default_provider', 'arvancloud');

        $this->taskRouter->assertProviderAllowedForTask($task, $providerName);

        $messages = $this->buildConversationMessages($conversation, $task, (string) $data['prompt']);
        $maxTokens = $this->taskRouter->maxOutputTokens(
            $task,
            isset($data['max_tokens']) ? (int) $data['max_tokens'] : null,
        );

        /** @var User $user */
        $user = $conversation->user;
        $billingSource = $this->billing->authorize($user, $task, $model, $messages, $maxTokens);

        $provider = $this->providerFactory->make($providerName);
        $modelCode = $model?->code ?? (string) config("services.{$providerName}.default_model", 'gpt-5-mini');

        $result = $provider->chat($messages, [
            'model' => $modelCode,
            'max_tokens' => $maxTokens,
        ]);

        $inTokens = (int) ($result['usage']['prompt_tokens'] ?? 0);
        $outTokens = (int) ($result['usage']['completion_tokens'] ?? 0);

        return DB::transaction(function () use (
            $conversation,
            $data,
            $result,
            $user,
            $billingSource,
            $model,
            $inTokens,
            $outTokens,
            $task,
            $providerName,
            $modelCode,
        ): AiMessage {
            $settlement = $this->billing->settle(
                $user,
                $billingSource,
                $model,
                $inTokens,
                $outTokens,
                [
                    'conversation_id' => $conversation->id,
                    'task' => $task,
                    'provider' => $result['provider'] ?? $providerName,
                    'model_code' => $result['model_code'] ?? $modelCode,
                ],
            );

            return $conversation->messages()->create([
                'prompt' => $data['prompt'],
                'response' => $result['content'],
                'in_tokens' => $inTokens,
                'out_tokens' => $outTokens,
                'cost_toman' => $settlement['cost_toman'],
                'raw_cost_usd' => $settlement['raw_cost_usd'],
                'billing_source' => $settlement['billing_source'],
                'provider' => $result['provider'] ?? $providerName,
                'model_code' => $result['model_code'] ?? $modelCode,
            ]);
        });
    }

    public function trackTokens(AiMessage $message, array $usage): AiMessage
    {
        return $this->trackTokens->execute($message, $usage);
    }

    public function manageModel(?object $model, array $data): AiModel
    {
        return $this->manageModels->execute($model, $data);
    }

    /**
     * Standalone text analysis endpoint with task routing, safety guardrails,
     * and optional user wallet/allowance metering.
     *
     * @param array<string, mixed> $options
     *
     * @return array<string, mixed>
     */
    public function analyze(string $text, array $options = [], ?User $user = null): array
    {
        $task = $this->taskRouter->normalizeTask($options['task'] ?? 'document_analysis');

        $requestedModel = isset($options['model_id'])
            ? AiModel::query()->find($options['model_id'])
            : null;

        $explicitProvider = isset($options['provider']) ? (string) $options['provider'] : null;

        $model = $requestedModel !== null
            ? $this->taskRouter->resolveModel($task, $requestedModel)
            : ($explicitProvider === null ? $this->taskRouter->resolveModel($task) : null);

        $providerName = $explicitProvider
            ?? $model?->provider
            ?? (string) config('ai.default_provider', 'arvancloud');

        $this->taskRouter->assertProviderAllowedForTask($task, $providerName);

        $maxTokens = $this->taskRouter->maxOutputTokens(
            $task,
            isset($options['max_tokens']) ? (int) $options['max_tokens'] : null,
        );

        $systemPrompt = $this->taskRouter->systemPrompt($task)
            ?? 'You are a helpful assistant. Analyze the following text and provide insights.';

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $text],
        ];

        $billingSource = null;
        if ($user !== null) {
            $billingSource = $this->billing->authorize($user, $task, $model, $messages, $maxTokens);
        }

        $provider = $this->providerFactory->make($providerName);
        $modelCode = $model?->code
            ?? ($options['model'] ?? config("services.{$providerName}.default_model"));

        $chatOptions = ['max_tokens' => $maxTokens];
        if (is_string($modelCode) && $modelCode !== '') {
            $chatOptions['model'] = $modelCode;
        }

        $result = $provider->chat($messages, $chatOptions);

        if ($user !== null && $billingSource !== null) {
            $inTokens = (int) ($result['usage']['prompt_tokens'] ?? 0);
            $outTokens = (int) ($result['usage']['completion_tokens'] ?? 0);

            $settlement = DB::transaction(fn (): array => $this->billing->settle(
                $user,
                $billingSource,
                $model,
                $inTokens,
                $outTokens,
                [
                    'task' => $task,
                    'provider' => $result['provider'] ?? $providerName,
                    'model_code' => $result['model_code'] ?? $modelCode,
                ],
            ));

            $result['billing'] = $settlement;
        }

        return $result;
    }

    /**
     * Build chronological [system?, ...history, current_user] message turns.
     *
     * @return array<int, array{role: string, content: string}>
     */
    private function buildConversationMessages(AiConversation $conversation, string $task, string $prompt): array
    {
        $messages = [];

        $systemPrompt = $this->taskRouter->systemPrompt($task);
        if ($systemPrompt !== null) {
            $messages[] = ['role' => 'system', 'content' => $systemPrompt];
        }

        $historyLimit = max(0, (int) config('ai.history_limit', 12));

        if ($historyLimit > 0) {
            $history = $conversation->messages()
                ->orderByDesc('id')
                ->limit($historyLimit)
                ->get(['prompt', 'response'])
                ->reverse();

            foreach ($history as $turn) {
                $messages[] = ['role' => 'user', 'content' => (string) $turn->prompt];
                if (! empty($turn->response)) {
                    $messages[] = ['role' => 'assistant', 'content' => (string) $turn->response];
                }
            }
        }

        $messages[] = ['role' => 'user', 'content' => $prompt];

        return $messages;
    }
}
