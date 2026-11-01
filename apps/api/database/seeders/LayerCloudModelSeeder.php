<?php

namespace Database\Seeders;

use App\Models\AiModel;
use Illuminate\Database\Seeder;

/**
 * Seeds the free-badge LayerCloud models into the `ai_models` catalogue so they
 * can be attached to conversations from the UI.
 *
 * Deliberately NOT part of DatabaseSeeder: the trial is opt-in. Run it by hand:
 *
 *     php artisan db:seed --class=LayerCloudModelSeeder
 *
 * Prices are per 1M tokens (the `ai_models.in_usd` / `out_usd` columns) copied
 * from the live LayerCloud pricing table on 2026-11-01, and mirror
 * `config('services.layercloud.model_pricing')`.
 *
 * Keep `LayerCloudModelSeeder` inactive entries in sync with
 * `config('services.layercloud.free_models')`: the guard rails only let the
 * callable ids through, so a row here that is missing from config would list a
 * model the provider then refuses to call.
 */
class LayerCloudModelSeeder extends Seeder
{
    /**
     * @var array<int, array{code: string, name: string, in_usd: float, out_usd: float, active: bool}>
     */
    private const MODELS = [
        ['code' => 'zai/glm-5.3-flash', 'name' => 'GLM 5.3 Flash (LayerCloud trial)', 'in_usd' => 0.0187, 'out_usd' => 0.0625, 'active' => true],
        ['code' => 'deepseek/deepseek-v4-flash-0731', 'name' => 'DeepSeek V4 Flash (LayerCloud trial)', 'in_usd' => 0.0163, 'out_usd' => 0.0450, 'active' => true],
        ['code' => 'deepseek/deepseek-v4.1-flash', 'name' => 'DeepSeek V4.1 Flash (LayerCloud trial)', 'in_usd' => 0.0375, 'out_usd' => 0.1500, 'active' => true],
        ['code' => 'alibaba/qwen3.7-pro', 'name' => 'Qwen 3.7 Pro (LayerCloud trial)', 'in_usd' => 0.0800, 'out_usd' => 0.3200, 'active' => true],
        ['code' => 'minimax/minimax-m3', 'name' => 'MiniMax M3 (LayerCloud trial)', 'in_usd' => 0.0750, 'out_usd' => 0.3000, 'active' => true],
        ['code' => 'zai/glm-5.2', 'name' => 'GLM 5.2 (LayerCloud trial)', 'in_usd' => 0.2415, 'out_usd' => 0.7590, 'active' => true],
        ['code' => 'deepseek/deepseek-v4-pro-0813', 'name' => 'DeepSeek V4 Pro (LayerCloud trial)', 'in_usd' => 0.2802, 'out_usd' => 0.8405, 'active' => true],
        ['code' => 'moonshotai/kimi-k2.7-code', 'name' => 'Kimi K2.7 Code (LayerCloud trial)', 'in_usd' => 0.1650, 'out_usd' => 0.8500, 'active' => true],
        ['code' => 'openai/gpt-5.3', 'name' => 'GPT-5.3-Codex (LayerCloud trial)', 'in_usd' => 0.4375, 'out_usd' => 3.5000, 'active' => true],
        ['code' => 'google/gemini-3.6-flash', 'name' => 'Gemini 3.6 Flash (LayerCloud trial)', 'in_usd' => 0.1875, 'out_usd' => 0.9375, 'active' => true],

        // Catalogued but kept inactive: available if a task needs them, not
        // shown as first-class choices in the assistant.
        ['code' => 'zai/glm-5.3', 'name' => 'GLM 5.3 (LayerCloud trial)', 'in_usd' => 0.3500, 'out_usd' => 1.1000, 'active' => false],
        ['code' => 'zai/glm-5.1', 'name' => 'GLM 5.1 (LayerCloud trial)', 'in_usd' => 0.2415, 'out_usd' => 0.7590, 'active' => false],
        ['code' => 'moonshotai/kimi-k3', 'name' => 'Kimi K3 (LayerCloud trial)', 'in_usd' => 0.7500, 'out_usd' => 3.7500, 'active' => false],
        ['code' => 'alibaba/qwen3.8-max', 'name' => 'Qwen 3.8 Max (LayerCloud trial)', 'in_usd' => 0.5000, 'out_usd' => 1.5000, 'active' => false],
        ['code' => 'openai/gpt-4o', 'name' => 'GPT-4o (LayerCloud trial)', 'in_usd' => 0.6250, 'out_usd' => 2.5000, 'active' => false],
        ['code' => 'openai/gpt-5.6-luna', 'name' => 'GPT-5.6 Luna (LayerCloud trial)', 'in_usd' => 0.0500, 'out_usd' => 0.3000, 'active' => false],
        ['code' => 'openai/gpt-oss', 'name' => 'GPT-OSS (LayerCloud trial)', 'in_usd' => 0.0200, 'out_usd' => 0.0800, 'active' => false],
    ];

    public function run(): void
    {
        foreach (self::MODELS as $model) {
            AiModel::query()->updateOrCreate(
                ['code' => $model['code']],
                [
                    'provider' => 'layercloud',
                    'name' => $model['name'],
                    'in_usd' => $model['in_usd'],
                    'out_usd' => $model['out_usd'],
                    'is_active' => $model['active'],
                ],
            );
        }

    }
}
