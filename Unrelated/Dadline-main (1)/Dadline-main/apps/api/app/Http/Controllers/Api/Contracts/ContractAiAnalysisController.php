<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Actions\Contracts\UpsertContractAiAnalysisAction;
use App\Enums\PaymentGateway;
use App\Enums\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contracts\StoreContractAiAnalysisRequest;
use App\Http\Resources\Contracts\ContractAiAnalysisResource;
use App\Models\Contract;
use App\Models\ContractAiAnalysis;
use App\Services\Contracts\ContractAiPricingService;
use App\Services\Purchases\PurchasePaymentService;
use Illuminate\Http\JsonResponse;

class ContractAiAnalysisController extends Controller
{
    public function show(Contract $contract): ContractAiAnalysisResource
    {
        $this->authorize('view', $contract);

        return new ContractAiAnalysisResource($contract->aiAnalysis()->firstOrFail());
    }

    public function pricing(Contract $contract, ContractAiPricingService $pricing): JsonResponse
    {
        $this->authorize('view', $contract);

        return response()->json([
            'data' => $pricing->quote(),
        ]);
    }

    public function store(
        StoreContractAiAnalysisRequest $request,
        Contract $contract,
        UpsertContractAiAnalysisAction $action,
        ContractAiPricingService $pricing,
        PurchasePaymentService $payments
    ): JsonResponse {
        $this->authorize('manageDraft', $contract);
        $validated = $request->validated();
        $quote = $pricing->quote();
        $service = $validated['ai_service'] ?? 'analysis';
        $amount = $service === 'rewrite'
            ? (int) $quote['rewrite_amount']
            : (int) $quote['analysis_amount'];

        if ($amount <= 0) {
            $analysis = $action->execute($contract, $validated);

            return response()->json([
                'data' => [
                    'status' => 'completed',
                    'requiresGateway' => false,
                    'paymentUrl' => null,
                    'analysis' => new ContractAiAnalysisResource($analysis),
                ],
            ]);
        }

        $result = $payments->start(
            user: $request->user(),
            purchaseType: 'contract_ai',
            purchasableId: $contract->id,
            amount: $amount,
            walletType: WalletTransactionType::ContractAi,
            payload: [
                ...$validated,
                'ai_service' => $service,
                'pricing' => $quote,
                'description' => $service === 'rewrite' ? 'بازنویسی هوشمند قرارداد' : 'تحلیل هوشمند قرارداد',
                'return_url' => $validated['return_url'] ?? null,
                'return_context' => $validated['return_context'] ?? ($service === 'rewrite' ? 'contract_ai_rewrite' : 'contract_ai_analysis'),
            ],
            preferredGateway: $this->gateway($validated['gateway'] ?? null)
        );

        return response()->json([
            'data' => [
                'status' => $result['intent']->status->value,
                'requiresGateway' => $result['requires_gateway'],
                'paymentUrl' => $result['payment_url'],
                'purchaseIntentId' => $result['intent']->id,
                'purchaseIntentUuid' => $result['intent']->uuid,
                'paymentId' => $result['payment']?->id,
                'gateway' => $result['payment']?->gateway,
                'gatewayToken' => $result['payment']?->gateway_token,
                'analysis' => $result['resource'] instanceof ContractAiAnalysis
                    ? new ContractAiAnalysisResource($result['resource'])
                    : null,
            ],
        ]);
    }

    private function gateway(?string $gateway): ?PaymentGateway
    {
        return match ($gateway) {
            PaymentGateway::Sep->value => PaymentGateway::Sep,
            PaymentGateway::Zibal->value => PaymentGateway::Zibal,
            PaymentGateway::SnappPay->value => PaymentGateway::SnappPay,
            default => null,
        };
    }
}
