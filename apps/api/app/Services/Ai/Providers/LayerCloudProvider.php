<?php

namespace App\Services\Ai\Providers;

use App\Services\Ai\Guardrails\PromptRedactor;
use App\Services\Ai\Guardrails\TrialGuard;
use GuzzleHttp\Client;

/**
 * LayerCloud AI gateway — TRAINING CIRCLE ONLY.
 *
 * One OpenAI-compatible endpoint fronting 128 models at 25–75% of list price.
 * The "Free" badge on their pricing page means "no top-up needed yet", not
 * "zero cost": every call is billed against the signup credit. Everything this
 * class does is therefore fenced by {@see TrialGuard}:
 *
 * - free-badge models only, no de-aligned variants;
 * - refuses to run in production while `LAYERCLOUD_TRIAL_ONLY` is on;
 * - hard daily token budget;
 * - prompts pass through {@see PromptRedactor} first;
 * - output tokens are clamped so a single call cannot run away.
 *
 * See docs/ai/layercloud-trial.md for the scope this route is allowed to serve.
 */
class LayerCloudProvider extends OpenAICompatibleProvider
{
    private TrialGuard $guard;

    private PromptRedactor $redactor;

    public function __construct(
        Client $httpClient,
        string $apiKey,
        ?TrialGuard $guard = null,
        ?PromptRedactor $redactor = null,
    ) {
        parent::__construct(
            httpClient: $httpClient,
            apiKey: $apiKey,
            baseUrl: (string) config('services.layercloud.base_url', 'https://ai.layercloud.org/v1'),
            defaultModel: (string) config('services.layercloud.default_model', 'zai/glm-5.3-flash'),
            providerName: 'layercloud',
        );

        $this->guard = $guard ?? new TrialGuard();
        $this->redactor = $redactor ?? new PromptRedactor();
    }

    public function chat(array $messages, array $options = []): array
    {
        $model = (string) ($options['model'] ?? $this->defaultModel);

        $this->guard->assertEnabled();
        $this->guard->assertModelAllowed($model);
        $this->guard->assertBudgetAvailable();

        $options['model'] = $model;
        $options['max_tokens'] = $this->clampOutputTokens($options['max_tokens'] ?? null);

        [$messages, $redactions] = $this->redactor->redactMessages($messages);

        $result = parent::chat($messages, $options);

        $promptTokens = (int) ($result['usage']['prompt_tokens'] ?? 0);
        $completionTokens = (int) ($result['usage']['completion_tokens'] ?? 0);

        $this->guard->recordUsage($promptTokens + $completionTokens);

        $result['estimated_cost_usd'] = $this->estimateCost($model, $promptTokens, $completionTokens);
        $result['redactions'] = $redactions;
        $result['trial'] = $this->guard->snapshot();

        return $result;
    }

    /**
     * Per-1M-token prices from the live LayerCloud table, keyed by the model id
     * we send (which is not always the id they echo back).
     */
    public function estimateCost(string $model, int $inputTokens, int $outputTokens): ?float
    {
        $pricing = config('services.layercloud.model_pricing', []);

        if (! isset($pricing[$model])) {
            return null;
        }

        [$in, $out] = $pricing[$model];

        return ($inputTokens * (float) $in + $outputTokens * (float) $out) / 1_000_000;
    }

    public function guard(): TrialGuard
    {
        return $this->guard;
    }

    private function clampOutputTokens(int|string|null $requested): int
    {
        $ceiling = (int) config('services.layercloud.max_output_tokens', 1024);

        if ($ceiling <= 0) {
            return 512;
        }

        if ($requested === null || $requested === '') {
            return $ceiling;
        }

        return max(1, min((int) $requested, $ceiling));
    }
}
