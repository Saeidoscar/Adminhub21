<?php

namespace App\Services\Purchases;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\PurchaseIntent;
use App\Services\Wallet\WalletService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AffiliateCommissionService
{
    public function __construct(
        private WalletService $wallets,
        private FinancialLedgerService $ledger
    ) {}

    public function createBlockedCommission(PurchaseIntent $intent, int $netPlatformIncome): ?AffiliateCommission
    {
        $buyer = $intent->user()->with('profile.referrer.affiliate')->first();
        $referrer = $buyer?->profile?->referrer;
        $affiliate = $referrer?->affiliate;

        if (! $affiliate instanceof Affiliate || $affiliate->status !== 'active') {
            return null;
        }

        $rate = (float) $affiliate->commission_rate;
        $amount = (int) round($netPlatformIncome * $rate);

        if ($amount <= 0 || $intent->purchaseTransaction === null) {
            return null;
        }

        $existing = AffiliateCommission::query()
            ->where('source_tx_id', $intent->purchase_transaction_id)
            ->first();

        if ($existing instanceof AffiliateCommission) {
            return $existing;
        }

        return DB::transaction(function () use ($intent, $affiliate, $referrer, $rate, $amount): AffiliateCommission {
            $commissionTx = $this->wallets->addBlockedCommission($referrer, $amount, [
                'purchase_intent_id' => $intent->id,
                'source_transaction_id' => $intent->purchase_transaction_id,
                'release_policy' => $this->releasePolicy($intent),
            ]);

            $this->ledger->recordAffiliateExpense($intent, $amount);

            return AffiliateCommission::query()->create([
                'affiliate_id' => $affiliate->id,
                'source_tx_id' => $intent->purchase_transaction_id,
                'commission_tx_id' => $commissionTx->id,
                'rate' => $rate,
                'amount' => $amount,
                'status' => 'pending',
                'release_at' => $this->releaseAt($intent),
                'payload' => [
                    'purchase_intent_id' => $intent->id,
                    'purchase_type' => $intent->purchase_type,
                    'release_policy' => $this->releasePolicy($intent),
                ],
            ]);
        });
    }

    public function release(AffiliateCommission $commission): void
    {
        if ($commission->released_at !== null || $commission->commissionTransaction === null) {
            return;
        }

        DB::transaction(function () use ($commission): void {
            $this->wallets->releaseBlockedAmount($commission->commissionTransaction->user, $commission->amount);

            $commission->forceFill([
                'status' => 'approved',
                'released_at' => now(),
            ])->save();
        });
    }

    private function releaseAt(PurchaseIntent $intent): ?Carbon
    {
        return in_array($intent->purchase_type, ['order', 'product', 'document'], true)
            ? now()->addDay()
            : null;
    }

    private function releasePolicy(PurchaseIntent $intent): string
    {
        return $this->releaseAt($intent) === null ? 'after_service_finished' : 'after_24_hours';
    }
}
