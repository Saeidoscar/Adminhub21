<?php

namespace App\Services\Payments;

use App\Enums\PaymentGateway;
use App\Models\PaymentGateway as PaymentGatewayModel;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Actions\Payments\InitiateZibalPaymentAction;
use App\Actions\Payments\InitiateSepPaymentAction;
use App\Actions\Payments\InitiateCryptoPaymentAction;

class PaymentGatewayService
{
    public function __construct(
        private readonly InitiateZibalPaymentAction $zibal,
        private readonly InitiateSepPaymentAction $sep,
        private readonly InitiateCryptoPaymentAction $crypto,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public function initiate(User $user, PaymentGateway $gateway, int $amount, array $payload = []): WalletTransaction
    {
        return match ($gateway) {
            PaymentGateway::Zibal => $this->zibal->execute($user, $amount, $payload),
            PaymentGateway::Sep => $this->sep->execute($user, $amount, $payload),
            PaymentGateway::Crypto => $this->crypto->execute($user, $amount, $payload),
        };
    }

    /**
     * @return array<int, PaymentGatewayModel>
     */
    public function availableGateways(): array
    {
        return PaymentGatewayModel::query()->active()->get()->all();
    }
}
