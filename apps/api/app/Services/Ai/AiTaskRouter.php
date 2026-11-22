<?php

namespace App\Services\Ai;

use App\Enums\AiConversationType;
use App\Exceptions\Ai\AiProviderException;
use App\Models\AiModel;
use Illuminate\Validation\ValidationException;

class AiTaskRouter
{
    public function normalizeTask(AiConversationType|string|null $task): string
    {
        if ($task instanceof AiConversationType) {
            return $task->value;
        }

        $value = strtolower(trim((string) $task));

        return $value !== '' ? $value : AiConversationType::MarketplaceHelp->value;
    }

    /**
     * @return array<string, mixed>
     */
    public function taskConfig(string $task): array
    {
        $tasks = (array) config('ai.tasks', []);

        if (isset($tasks[$task]) && is_array($tasks[$task])) {
            return $tasks[$task];
        }

        return (array) ($tasks[AiConversationType::MarketplaceHelp->value] ?? []);
    }

    public function maxOutputTokens(string $task, ?int $requestedMaxTokens = null): int
    {
        $config = $this->taskConfig($task);
        $ceiling = max(1, (int) ($config['max_tokens'] ?? 1024));

        if ($requestedMaxTokens === null || $requestedMaxTokens <= 0) {
            return $ceiling;
        }

        return min($requestedMaxTokens, $ceiling);
    }

    public function systemPrompt(string $task): ?string
    {
        $config = $this->taskConfig($task);
        $prompt = trim((string) ($config['system_prompt'] ?? ''));

        return $prompt !== '' ? $prompt : null;
    }

    public function forbidsTrialProviders(string $task): bool
    {
        $config = $this->taskConfig($task);

        return (bool) ($config['forbid_trial_providers'] ?? false);
    }

    public function assertProviderAllowedForTask(string $task, string $provider): void
    {
        if ($this->forbidsTrialProviders($task) && strtolower(trim($provider)) === 'layercloud') {
            throw AiProviderException::blocked(
                "task [{$task}] handles sensitive data and cannot route through [layercloud].",
            );
        }
    }

    /**
     * Resolve the model to run for `$task`. When a specific model is chosen,
     * enforce active state and task policy; otherwise select the best active
     * model matching the task's `preferred_models` ranking.
     */
    public function resolveModel(string $task, ?AiModel $requestedModel = null): ?AiModel
    {
        if ($requestedModel !== null) {
            if (! $requestedModel->isActive()) {
                throw ValidationException::withMessages([
                    'model_id' => ["AI model [{$requestedModel->code}] is currently inactive."],
                ]);
            }

            $this->assertProviderAllowedForTask($task, $requestedModel->provider);

            return $requestedModel;
        }

        $config = $this->taskConfig($task);
        $preferredCodes = array_values(array_filter(
            (array) ($config['preferred_models'] ?? []),
            'is_string',
        ));

        $query = AiModel::query()->active();

        if ($this->forbidsTrialProviders($task)) {
            $query->where('provider', '!=', 'layercloud');
        }

        $activeModels = $query->get();

        if ($activeModels->isEmpty()) {
            return null;
        }

        $defaultProvider = strtolower((string) config('ai.default_provider', 'arvancloud'));

        foreach ($preferredCodes as $code) {
            $preferredMatch = $activeModels->first(
                static fn (AiModel $m): bool => $m->code === $code && $m->provider === $defaultProvider,
            );
            if ($preferredMatch !== null) {
                return $preferredMatch;
            }

            $anyProviderMatch = $activeModels->first(
                static fn (AiModel $m): bool => $m->code === $code,
            );
            if ($anyProviderMatch !== null) {
                return $anyProviderMatch;
            }
        }

        return $activeModels->firstWhere('provider', $defaultProvider) ?? $activeModels->first();
    }
}
