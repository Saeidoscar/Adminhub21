<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
    ],

    'anthropic' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
    ],

    'openrouter' => [
        'api_key' => env('OPENROUTER_API_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Shared HTTP client
    |--------------------------------------------------------------------------
    |
    | `app('guzzle')` is the client every AI provider uses. Read from config
    | rather than env() inside the provider so `php artisan config:cache` keeps
    | working in deployed environments.
    |
    */

    'ai_http' => [
        'timeout' => (float) env('AI_HTTP_TIMEOUT', 45),
        'connect_timeout' => (float) env('AI_HTTP_CONNECT_TIMEOUT', 10),
    ],

    /*
    |--------------------------------------------------------------------------
    | LayerCloud AI gateway — TRAINING CIRCLE ONLY
    |--------------------------------------------------------------------------
    |
    | A cheap OpenAI-compatible router (https://ai.layercloud.org). It is not a
    | compliance-grade route: the gateway forwards prompts to upstream providers
    | under their own retention policies and offers no DPA or EU residency.
    |
    | Guard rails enforced in code (App\Services\Ai\Guardrails\TrialGuard):
    |   - LAYERCLOUD_ENABLED must be true; nothing is routed here implicitly.
    |   - With LAYERCLOUD_TRIAL_ONLY=true the provider refuses to run when
    |     APP_ENV=production, so the trial cannot be promoted by accident.
    |   - Only models carrying LayerCloud's "Free" badge are callable. "Free"
    |     means "no top-up needed", not "no cost" — every token is still billed
    |     against the signup credit.
    |   - `:jailbreak` / `:uncensored` variants are always refused.
    |   - A daily token budget caps a runaway loop.
    |   - Prompts pass through App\Services\Ai\Guardrails\PromptRedactor.
    |
    | Scope: assistant chat, ticket triage, i18n drafting, moderation
    | pre-screening. Never contracts, identity documents or payment data.
    | See docs/ai/layercloud-trial.md.
    |
    */

    'layercloud' => [
        'api_key' => env('LAYERCLOUD_API_KEY'),
        'base_url' => env('LAYERCLOUD_BASE_URL', 'https://ai.layercloud.org/v1'),
        'enabled' => (bool) env('LAYERCLOUD_ENABLED', false),
        'trial_only' => (bool) env('LAYERCLOUD_TRIAL_ONLY', true),
        'default_model' => env('LAYERCLOUD_DEFAULT_MODEL', 'zai/glm-5.3-flash'),
        'allowed_models' => env('LAYERCLOUD_ALLOWED_MODELS', ''),
        'daily_token_budget' => (int) env('LAYERCLOUD_DAILY_TOKEN_BUDGET', 200000),
        'max_output_tokens' => (int) env('LAYERCLOUD_MAX_OUTPUT_TOKENS', 1024),

        /*
        | Models that carried a "Free" badge on the pricing page on 2026-11-01,
        | text/chat only. Image and video models are excluded on purpose: they
        | are billed per token at $2–33 per 1M with an 8K context window, which
        | is the worst value on the catalogue.
        */
        'free_models' => [
            // Z.ai
            'zai/glm-5.3-flash',
            'zai/glm-5.3',
            'zai/glm-5.2',
            'zai/glm-5.1',
            // DeepSeek
            'deepseek/deepseek-v4-flash-0731',
            'deepseek/deepseek-v4.1-flash',
            'deepseek/deepseek-v4-pro-0813',
            // Alibaba
            'alibaba/qwen3.8-max',
            'alibaba/qwen3.7-pro',
            // Moonshot
            'moonshotai/kimi-k3',
            'moonshotai/kimi-k2.7-code',
            // MiniMax
            'minimax/minimax-m3',
            // OpenAI (routed by the gateway)
            'openai/gpt-5.3',
            'openai/gpt-5.6-luna',
            'openai/gpt-4o',
            'openai/gpt-oss',
            // Google
            'google/gemini-3.6-flash',
        ],

        /*
        | Live gateway prices per 1M tokens as `[input, output]`, captured
        | 2026-11-01. Used only for the cost estimate attached to each reply;
        | billing always follows the gateway's own `usage` payload.
        */
        'model_pricing' => [
            'zai/glm-5.3-flash' => [0.0187, 0.0625],
            'zai/glm-5.3' => [0.35, 1.10],
            'zai/glm-5.2' => [0.2415, 0.759],
            'zai/glm-5.1' => [0.2415, 0.759],
            'deepseek/deepseek-v4-flash-0731' => [0.0163, 0.045],
            'deepseek/deepseek-v4.1-flash' => [0.0375, 0.15],
            'deepseek/deepseek-v4-pro-0813' => [0.2802, 0.8405],
            'alibaba/qwen3.8-max' => [0.50, 1.50],
            'alibaba/qwen3.7-pro' => [0.08, 0.32],
            'moonshotai/kimi-k3' => [0.75, 3.75],
            'moonshotai/kimi-k2.7-code' => [0.165, 0.85],
            'minimax/minimax-m3' => [0.075, 0.30],
            'openai/gpt-5.3' => [0.4375, 3.50],
            'openai/gpt-5.6-luna' => [0.05, 0.30],
            'openai/gpt-4o' => [0.625, 2.50],
            'openai/gpt-oss' => [0.02, 0.08],
            'google/gemini-3.6-flash' => [0.1875, 0.9375],
        ],
    ],

];
