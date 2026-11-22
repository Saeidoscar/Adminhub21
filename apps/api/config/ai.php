<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Production Provider & FX Pricing
    |--------------------------------------------------------------------------
    |
    | Wallet balances in AdminHub21 are denominated in Toman. Because upstream
    | token costs track USD/USDT, user charges are computed dynamically from
    | `ai_models.in_usd` / `ai_models.out_usd` using the configured rate and
    | platform markup (covering 10% VAT, gateway fees, FX buffer and margin).
    |
    */

    'default_provider' => env('AI_DEFAULT_PROVIDER', 'arvancloud'),

    'usd_to_toman' => (int) env('AI_USD_TO_TOMAN', 270000),

    // 0.40 = 40% markup over raw USD token cost (1.40x total).
    'markup_rate' => (float) env('AI_MARKUP_RATE', 0.40),

    // Minimum non-zero charge in Toman so small calls do not round to 0.
    'minimum_charge_toman' => (int) env('AI_MINIMUM_CHARGE_TOMAN', 1),

    // How many prior prompt/response pairs to send as chat context.
    'history_limit' => (int) env('AI_HISTORY_LIMIT', 12),

    /*
    |--------------------------------------------------------------------------
    | Daily Free Allowance (Cost-Bounded Acquisition Tier)
    |--------------------------------------------------------------------------
    |
    | Only cheap, non-sensitive tasks and budget models are eligible for the
    | daily free token allowance. Once a user crosses `daily_tokens` (or picks
    | a paid/reasoning/contract model), requests require Wallet balance.
    |
    */

    'free_allowance' => [
        'enabled' => (bool) env('AI_FREE_ALLOWANCE_ENABLED', true),
        'daily_tokens' => (int) env('AI_FREE_DAILY_TOKENS', 25000),
        'allowed_tasks' => [
            'marketplace_help',
            'ticket_triage',
            'moderation',
            'i18n_draft',
        ],
        'allowed_models' => [
            'gpt-5-nano',
            'gpt-oss-120b',
            'deepseek-v4.1-flash',
            'deepseek-chat',
            'gpt-4o-mini',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Task-Based Routing & Output Token Caps
    |--------------------------------------------------------------------------
    |
    | Maps each product task / conversation type to its preferred model order,
    | output ceiling (`max_tokens`), and whether free allowance or trial
    | providers (LayerCloud) are permitted.
    |
    */

    'tasks' => [
        'ticket_triage' => [
            'preferred_models' => ['gpt-5-nano', 'gpt-oss-120b', 'deepseek-v4.1-flash', 'gpt-4o-mini'],
            'max_tokens' => (int) env('AI_TASK_TRIAGE_MAX_TOKENS', 600),
            'allow_free_tier' => true,
            'forbid_trial_providers' => false,
            'system_prompt' => 'You are a concise marketplace support triage assistant. Classify priority, summarise the issue, and suggest next steps.',
        ],
        'moderation' => [
            'preferred_models' => ['gpt-5-nano', 'gpt-oss-120b', 'deepseek-v4.1-flash', 'gpt-4o-mini'],
            'max_tokens' => (int) env('AI_TASK_MODERATION_MAX_TOKENS', 500),
            'allow_free_tier' => true,
            'forbid_trial_providers' => false,
            'system_prompt' => 'You are a content moderation pre-screener. Flag policy risks clearly and neutrally in structured form.',
        ],
        'i18n_draft' => [
            'preferred_models' => ['deepseek-v4.1-flash', 'gpt-5-nano', 'gpt-5-mini', 'gpt-4o-mini'],
            'max_tokens' => (int) env('AI_TASK_I18N_MAX_TOKENS', 1024),
            'allow_free_tier' => true,
            'forbid_trial_providers' => false,
            'system_prompt' => 'You are a bilingual Persian/English product copywriter. Produce natural, idiomatic translations.',
        ],
        'marketplace_help' => [
            'preferred_models' => ['deepseek-v4.1-flash', 'gpt-5-mini', 'gpt-5-mini-2025-08-07', 'gpt-oss-120b', 'gpt-4o-mini'],
            'max_tokens' => (int) env('AI_TASK_CHAT_MAX_TOKENS', 1024),
            'allow_free_tier' => true,
            'forbid_trial_providers' => false,
            'system_prompt' => 'You are the AdminHub21 hiring and marketplace assistant. Help employers and specialists concisely in their language.',
        ],
        'case_research' => [
            'preferred_models' => ['grok-4.3', 'gpt-5-mini', 'gpt-5-mini-2025-08-07', 'deepseek-v4.1-flash'],
            'max_tokens' => (int) env('AI_TASK_RESEARCH_MAX_TOKENS', 2048),
            'allow_free_tier' => false,
            'forbid_trial_providers' => false,
            'system_prompt' => 'You are a marketplace strategy and research analyst. Provide structured, evidence-based recommendations.',
        ],
        'reasoning' => [
            'preferred_models' => ['grok-4.3', 'grok-4.5', 'gpt-5-mini', 'gpt-5'],
            'max_tokens' => (int) env('AI_TASK_REASONING_MAX_TOKENS', 2048),
            'allow_free_tier' => false,
            'forbid_trial_providers' => false,
            'system_prompt' => 'Think systematically and provide clear, actionable reasoning.',
        ],
        'document_analysis' => [
            'preferred_models' => ['claude-sonnet-4-6', 'gpt-5', 'gpt-5-mini', 'claude-3-5-haiku-20241022'],
            'max_tokens' => (int) env('AI_TASK_DOCUMENT_MAX_TOKENS', 2048),
            'allow_free_tier' => false,
            'forbid_trial_providers' => true,
            'system_prompt' => 'You analyse business documents and agreements carefully, highlighting obligations, risks, and ambiguities.',
        ],
        'legal_question' => [
            'preferred_models' => ['claude-sonnet-4-6', 'gpt-5', 'claude-3-5-haiku-20241022', 'gpt-5-mini'],
            'max_tokens' => (int) env('AI_TASK_LEGAL_MAX_TOKENS', 2048),
            'allow_free_tier' => false,
            'forbid_trial_providers' => true,
            'system_prompt' => 'You assist with service agreement structure and commercial clauses. Clarify that outputs require human legal review.',
        ],
        'contract_draft' => [
            'preferred_models' => ['claude-sonnet-4-6', 'gpt-5', 'claude-3-5-haiku-20241022'],
            'max_tokens' => (int) env('AI_TASK_CONTRACT_MAX_TOKENS', 3072),
            'allow_free_tier' => false,
            'forbid_trial_providers' => true,
            'system_prompt' => 'You draft clear, balanced service agreement clauses in Persian or English.',
        ],
        'contract_review' => [
            'preferred_models' => ['claude-sonnet-4-6', 'gpt-5', 'claude-3-5-haiku-20241022'],
            'max_tokens' => (int) env('AI_TASK_CONTRACT_MAX_TOKENS', 3072),
            'allow_free_tier' => false,
            'forbid_trial_providers' => true,
            'system_prompt' => 'You review service agreements for missing protections, payment schedule gaps, and termination clarity.',
        ],
    ],

];
