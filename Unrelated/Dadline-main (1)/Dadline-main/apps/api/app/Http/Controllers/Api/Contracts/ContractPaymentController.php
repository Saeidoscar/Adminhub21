<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Enums\ContractEventType;
use App\Enums\PaymentGateway;
use App\Enums\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contracts\ContractPaymentRequest;
use App\Http\Resources\Contracts\ContractEventResource;
use App\Http\Resources\Contracts\ContractResource;
use App\Models\Contract;
use App\Services\Contracts\ContractPricingService;
use App\Services\Purchases\PurchasePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ContractPaymentController extends Controller
{
    public function pricing(Contract $contract, ContractPricingService $pricing): JsonResponse
    {
        $this->authorize('view', $contract);

        return response()->json([
            'data' => $pricing->quote($contract),
        ]);
    }

    public function show(Contract $contract): ContractEventResource
    {
        $this->authorize('view', $contract);

        $event = $contract->events()
            ->where('event_type', ContractEventType::PaymentCompleted->value)
            ->latest('occurred_at')
            ->firstOrFail();

        return new ContractEventResource($event);
    }

    public function store(
        ContractPaymentRequest $request,
        Contract $contract,
        ContractPricingService $pricing,
        PurchasePaymentService $payments
    ): JsonResponse {
        $this->authorize('activate', $contract);
        $this->ensureLevelTwoVerified($request);

        $quote = $pricing->quote($contract);
        $validated = $request->validated();
        $gateway = $this->gateway($validated['gateway'] ?? null);

        $result = $payments->start(
            user: $request->user(),
            purchaseType: 'contract',
            purchasableId: $contract->id,
            amount: $quote['total_amount'],
            walletType: WalletTransactionType::ContractCost,
            payload: [
                ...$validated,
                'pricing' => $quote,
                'description' => 'هزینه ثبت قرارداد',
                'return_url' => $validated['return_url'] ?? null,
                'return_context' => $validated['return_context'] ?? 'contract_activation',
            ],
            preferredGateway: $gateway
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
                'contract' => $result['resource'] instanceof Contract
                    ? new ContractResource($result['resource'])
                    : null,
            ],
        ]);
    }

    private function ensureLevelTwoVerified(ContractPaymentRequest $request): void
    {
        $user = $request->user()->loadMissing('verification');

        if ((int) ($user->verification?->verified_level ?? 0) >= 2 && $user->verification?->isVerified()) {
            return;
        }

        throw ValidationException::withMessages([
            'verification' => 'برای ثبت نهایی و ارسال دعوت‌نامه قرارداد، ابتدا احراز هویت سطح ۲ را تکمیل کنید.',
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
