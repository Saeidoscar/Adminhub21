<?php

namespace App\Services\Purchases;

use App\Actions\Contracts\ActivateContractAction;
use App\Actions\Contracts\UpsertContractAiAnalysisAction;
use App\Models\Contract;
use App\Models\ContractAiAnalysis;
use App\Models\PurchaseIntent;
use App\Services\Identity\Data\UserVerificationAttempt;
use App\Services\Identity\UserBankAccountVerificationService;
use App\Services\Identity\UserIdentityVerificationService;
use Illuminate\Validation\ValidationException;

class FulfillPurchaseService
{
    public function __construct(
        private ActivateContractAction $activateContract,
        private UpsertContractAiAnalysisAction $upsertContractAiAnalysis,
        private UserIdentityVerificationService $identityVerification,
        private UserBankAccountVerificationService $bankAccountVerification,
    ) {}

    public function execute(PurchaseIntent $intent): mixed
    {
        return match ($intent->purchase_type) {
            'contract' => $this->activateContract($intent),
            'contract_ai' => $this->upsertContractAiAnalysis($intent),
            'user_verification_level_one' => $this->verifyUserLevelOne($intent),
            'user_verification_level_two' => $this->verifyUserLevelTwo($intent),
            'user_bank_account_verification' => $this->verifyUserBankAccount($intent),
            default => null,
        };
    }

    private function activateContract(PurchaseIntent $intent): Contract
    {
        $contract = Contract::query()->findOrFail($intent->purchasable_id);

        if (! $contract->isDraft()) {
            if ($contract->status === 'active') {
                return $contract;
            }

            throw ValidationException::withMessages([
                'contract' => 'Contract is not payable in its current state.',
            ]);
        }

        return $this->activateContract->execute(
            contract: $contract,
            paymentData: [
                'amount' => $intent->amount,
                'wallet_transaction_id' => $intent->purchase_transaction_id,
                'purchase_intent_id' => $intent->id,
                'pricing' => $intent->payload['pricing'] ?? null,
            ],
            actor: $intent->user
        );
    }

    private function upsertContractAiAnalysis(PurchaseIntent $intent): ContractAiAnalysis
    {
        $contract = Contract::query()->findOrFail($intent->purchasable_id);
        $payload = $intent->payload;

        return $this->upsertContractAiAnalysis->execute($contract, [
            'ai_data' => $payload['ai_data'] ?? [],
            'ai_content' => $payload['ai_content'] ?? null,
        ]);
    }

    private function verifyUserLevelOne(PurchaseIntent $intent): UserVerificationAttempt
    {
        $user = $intent->user()->with(['profile', 'verification'])->firstOrFail();
        $nationalId = $intent->payload['national_id'] ?? null;

        if (! is_string($nationalId) || ! preg_match('/^\d{10}$/', $nationalId)) {
            throw ValidationException::withMessages([
                'nationalId' => ['کد ملی برای احراز هویت سطح ۱ معتبر نیست.'],
            ]);
        }

        return $this->identityVerification->verifyLevelOne(
            user: $user,
            nationalCode: $nationalId,
            inquiryCost: $intent->amount,
            metadata: [
                'wallet_transaction_id' => $intent->purchase_transaction_id,
                'purchase_intent_id' => $intent->id,
            ],
        );
    }

    private function verifyUserLevelTwo(PurchaseIntent $intent): UserVerificationAttempt
    {
        $user = $intent->user()->with(['profile', 'verification'])->firstOrFail();
        $birthDate = $intent->payload['birth_date'] ?? null;

        if (! is_string($birthDate) || $birthDate === '') {
            throw ValidationException::withMessages([
                'birthDate' => ['تاریخ تولد برای احراز هویت سطح ۲ معتبر نیست.'],
            ]);
        }

        return $this->identityVerification->verifyLevelTwo(
            user: $user,
            birthDate: $birthDate,
            inquiryCost: $intent->amount,
            metadata: [
                'wallet_transaction_id' => $intent->purchase_transaction_id,
                'purchase_intent_id' => $intent->id,
            ],
        );
    }

    private function verifyUserBankAccount(PurchaseIntent $intent): UserVerificationAttempt
    {
        $user = $intent->user()->with(['profile', 'verification'])->firstOrFail();
        $iban = $intent->payload['iban'] ?? null;

        if (! is_string($iban) || ! preg_match('/^IR\d{24}$/', $iban)) {
            throw ValidationException::withMessages([
                'iban' => ['شماره شبا برای استعلام معتبر نیست.'],
            ]);
        }

        return $this->bankAccountVerification->verifyAndStore(
            user: $user,
            iban: $iban,
            inquiryCost: $intent->amount,
            metadata: [
                'wallet_transaction_id' => $intent->purchase_transaction_id,
                'purchase_intent_id' => $intent->id,
            ],
        );
    }
}
