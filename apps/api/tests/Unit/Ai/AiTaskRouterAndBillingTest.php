<?php

namespace Tests\Unit\Ai;

use App\Exceptions\Ai\AiProviderException;
use App\Models\AiModel;
use App\Services\Ai\AiBillingService;
use App\Services\Ai\AiTaskRouter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiTaskRouterAndBillingTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_router_selects_preferred_model_and_clamps_max_tokens(): void
    {
        $nano = AiModel::create([
            'provider' => 'avalai',
            'code' => 'gpt-5-nano',
            'name' => 'GPT-5 Nano',
            'in_usd' => 0.05,
            'out_usd' => 0.40,
            'is_active' => true,
        ]);

        $sonnet = AiModel::create([
            'provider' => 'arvancloud',
            'code' => 'claude-sonnet-4-6',
            'name' => 'Claude Sonnet 4.6',
            'in_usd' => 3.00,
            'out_usd' => 15.00,
            'is_active' => true,
        ]);

        $router = app(AiTaskRouter::class);

        $this->assertSame($nano->id, $router->resolveModel('ticket_triage')?->id);
        $this->assertSame($sonnet->id, $router->resolveModel('contract_review')?->id);

        $this->assertSame(600, $router->maxOutputTokens('ticket_triage'));
        $this->assertSame(600, $router->maxOutputTokens('ticket_triage', 16000));
        $this->assertSame(250, $router->maxOutputTokens('ticket_triage', 250));
        $this->assertSame(3072, $router->maxOutputTokens('contract_review'));
    }

    public function test_task_router_forbids_layercloud_for_sensitive_tasks(): void
    {
        $trialModel = AiModel::create([
            'provider' => 'layercloud',
            'code' => 'zai/glm-5.3-flash',
            'name' => 'GLM Flash',
            'in_usd' => 0.0187,
            'out_usd' => 0.0625,
            'is_active' => true,
        ]);

        $router = app(AiTaskRouter::class);

        $this->expectException(AiProviderException::class);
        $this->expectExceptionMessage('cannot route through [layercloud]');

        $router->resolveModel('contract_review', $trialModel);
    }

    public function test_billing_service_computes_exact_toman_charge_with_markup(): void
    {
        config()->set('ai.usd_to_toman', 270000);
        config()->set('ai.markup_rate', 0.40);
        config()->set('ai.minimum_charge_toman', 1);

        $billing = app(AiBillingService::class);

        // 1,000,000 input ($3.00) + 1,000,000 output ($15.00) = $18.00 raw
        // $18.00 * 270,000 * 1.40 = 6,804,000 Toman
        $charge = $billing->calculateChargeToman(3.00, 15.00, 1_000_000, 1_000_000);
        $this->assertSame(6804000, $charge);

        // Small turn on gpt-5-nano: 1,500 in ($0.05/1M) + 500 out ($0.40/1M)
        // raw USD = 0.000075 + 0.000200 = $0.000275
        // 0.000275 * 270,000 * 1.40 = 103.95 -> ceil = 104 Toman
        $smallTurn = $billing->calculateChargeToman(0.05, 0.40, 1500, 500);
        $this->assertSame(104, $smallTurn);
    }
}
