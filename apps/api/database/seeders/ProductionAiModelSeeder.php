<?php

namespace Database\Seeders;

use App\Models\AiModel;
use Illuminate\Database\Seeder;

/**
 * Seeds the curated Toman-billed production AI catalogue for AdminHub21
 * across ArvanCloud AIaaS and AvalAI (OpenAI, Anthropic, DeepSeek, Grok).
 *
 * Run explicitly during production provisioning:
 *
 *     php artisan db:seed --class=ProductionAiModelSeeder
 *
 * `in_usd` / `out_usd` store per-1M-token USD reference rates so user Toman
 * charges adapt automatically when `AI_USD_TO_TOMAN` or `AI_MARKUP_RATE` changes.
 */
class ProductionAiModelSeeder extends Seeder
{
    /**
     * @var array<int, array{provider: string, code: string, name: string, in_usd: float, out_usd: float, active: bool}>
     */
    private const MODELS = [
        // ── ArvanCloud AIaaS (Iran wallet, pure PAYG) ────────────────────────
        ['provider' => 'arvancloud', 'code' => 'gpt-oss-120b', 'name' => 'GPT-OSS 120B (ArvanCloud Hosted)', 'in_usd' => 0.0940, 'out_usd' => 0.4700, 'active' => true],
        ['provider' => 'arvancloud', 'code' => 'gpt-5-mini', 'name' => 'GPT-5 Mini (ArvanCloud)', 'in_usd' => 0.2500, 'out_usd' => 2.0000, 'active' => true],
        ['provider' => 'arvancloud', 'code' => 'gpt-5', 'name' => 'GPT-5 (ArvanCloud)', 'in_usd' => 1.2500, 'out_usd' => 10.0000, 'active' => true],
        ['provider' => 'arvancloud', 'code' => 'claude-sonnet-4-6', 'name' => 'Claude Sonnet 4.6 (ArvanCloud)', 'in_usd' => 3.0000, 'out_usd' => 15.0000, 'active' => true],

        // ── AvalAI (Toman wallet, 0% markup on OpenAI / DeepSeek / Grok) ────
        ['provider' => 'avalai', 'code' => 'gpt-5-nano', 'name' => 'GPT-5 Nano (AvalAI)', 'in_usd' => 0.0500, 'out_usd' => 0.4000, 'active' => true],
        ['provider' => 'avalai', 'code' => 'deepseek-v4.1-flash', 'name' => 'DeepSeek V4.1 Flash (AvalAI)', 'in_usd' => 0.1500, 'out_usd' => 0.6000, 'active' => true],
        ['provider' => 'avalai', 'code' => 'grok-4.3', 'name' => 'Grok 4.3 (AvalAI)', 'in_usd' => 1.2500, 'out_usd' => 2.5000, 'active' => true],
    ];

    public function run(): void
    {
        foreach (self::MODELS as $model) {
            AiModel::query()->updateOrCreate(
                ['code' => $model['code']],
                [
                    'provider' => $model['provider'],
                    'name' => $model['name'],
                    'in_usd' => $model['in_usd'],
                    'out_usd' => $model['out_usd'],
                    'is_active' => $model['active'],
                ],
            );
        }
    }
}
