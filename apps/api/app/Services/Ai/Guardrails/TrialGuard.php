<?php

namespace App\Services\Ai\Guardrails;

use App\Exceptions\Ai\AiProviderException;
use Illuminate\Support\Facades\Cache;

/**
 * The training-circle fence around the LayerCloud provider.
 *
 * Four independent rules, each of which fails closed:
 *
 * 1. The provider must be switched on explicitly (`LAYERCLOUD_ENABLED`).
 * 2. When `LAYERCLOUD_TRIAL_ONLY` is true the provider refuses to run in a
 *    production environment at all — the trial cannot be promoted by accident.
 * 3. Only models carrying LayerCloud's "Free" (no-top-up) badge may be called,
 *    and never a `:jailbreak` / `:uncensored` variant.
 * 4. A rolling daily token budget caps the blast radius of a runaway loop, so
 *    the signup credit cannot be drained overnight.
 */
class TrialGuard
{
    private const CACHE_PREFIX = 'layercloud:trial:tokens:';

    public function assertEnabled(): void
    {
        if (! (bool) $this->config('enabled', false)) {
            throw AiProviderException::blocked(
                'the provider is disabled. Set LAYERCLOUD_ENABLED=true to opt in.',
            );
        }

        if ($this->config('trial_only', true) && app()->environment('production')) {
            throw AiProviderException::blocked(
                'LAYERCLOUD_TRIAL_ONLY is on and this is a production environment. '
                . 'The trial route is for development and non-PII drafting only.',
            );
        }
    }

    /**
     * @throws AiProviderException when the model is not on the free allow-list
     */
    public function assertModelAllowed(string $model): void
    {
        if ($model === '') {
            throw AiProviderException::blocked('no model was requested.');
        }

        foreach ([':jailbreak', ':uncensored'] as $suffix) {
            if (str_contains(strtolower($model), $suffix)) {
                throw AiProviderException::blocked(
                    "model [{$model}] is a de-aligned variant and is never routed for this product.",
                );
            }
        }

        $allowed = $this->allowedModels();

        if (! in_array($model, $allowed, true)) {
            throw AiProviderException::blocked(sprintf(
                'model [%s] is not on the free-tier allow-list (%d models). Add it to '
                . 'services.layercloud.free_models only after checking its badge on the pricing page.',
                $model,
                count($allowed),
            ));
        }
    }

    /**
     * Free-badge models from config, intersected with the optional
     * `LAYERCLOUD_ALLOWED_MODELS` shortlist from the environment.
     *
     * @return array<int, string>
     */
    public function allowedModels(): array
    {
        $free = array_values(array_filter((array) $this->config('free_models', []), 'is_string'));

        $shortlist = array_values(array_filter(
            array_map('trim', explode(',', (string) $this->config('allowed_models', ''))),
            static fn (string $model): bool => $model !== '',
        ));

        if ($shortlist === []) {
            return $free;
        }

        return array_values(array_intersect($free, $shortlist));
    }

    public function assertBudgetAvailable(): void
    {
        $budget = $this->dailyBudget();

        if ($budget <= 0) {
            throw AiProviderException::blocked('the daily token budget is set to 0.');
        }

        if ($this->usedTokensToday() >= $budget) {
            throw AiProviderException::blocked(sprintf(
                'the daily token budget is exhausted (%d/%d). Raise LAYERCLOUD_DAILY_TOKEN_BUDGET '
                . 'deliberately, or wait for the next UTC day.',
                $this->usedTokensToday(),
                $budget,
            ));
        }
    }

    public function recordUsage(int $tokens): void
    {
        if ($tokens <= 0) {
            return;
        }

        $key = $this->usageKey();

        Cache::add($key, 0, now()->endOfDay()->addMinute());
        Cache::increment($key, $tokens);
    }

    public function usedTokensToday(): int
    {
        return (int) Cache::get($this->usageKey(), 0);
    }

    public function dailyBudget(): int
    {
        return (int) $this->config('daily_token_budget', 200000);
    }

    /**
     * @return array{used_today: int, daily_budget: int, remaining: int}
     */
    public function snapshot(): array
    {
        $used = $this->usedTokensToday();
        $budget = $this->dailyBudget();

        return [
            'used_today' => $used,
            'daily_budget' => $budget,
            'remaining' => max(0, $budget - $used),
        ];
    }

    /**
     * Clear today's counter. Only useful for local experiments and tests.
     */
    public function reset(): void
    {
        Cache::forget($this->usageKey());
    }

    private function usageKey(): string
    {
        return self::CACHE_PREFIX . now('UTC')->toDateString();
    }

    private function config(string $key, mixed $default = null): mixed
    {
        return config('services.layercloud.' . $key, $default);
    }
}
