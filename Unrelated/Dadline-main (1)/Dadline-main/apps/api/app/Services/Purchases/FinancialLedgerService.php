<?php

namespace App\Services\Purchases;

use App\Enums\FinancialDirection;
use App\Enums\FinancialStatus;
use App\Models\Financial;
use App\Models\PurchaseIntent;

class FinancialLedgerService
{
    public function recordIncome(PurchaseIntent $intent, PlatformRevenueBreakdown $breakdown): Financial
    {
        $existing = Financial::query()
            ->where('direction', FinancialDirection::Income->value)
            ->where('item_id', $intent->id)
            ->first();

        if ($existing instanceof Financial) {
            return $existing;
        }

        return Financial::query()->create([
            'direction' => FinancialDirection::Income,
            'gross_amount' => $breakdown->grossCommission,
            'vat_amount' => $breakdown->vatAmount,
            'net_amount' => $breakdown->netIncome,
            'status' => FinancialStatus::Accepted,
            'item_id' => $intent->id,
            'payload' => [
                'purchase_intent_id' => $intent->id,
                'purchase_type' => $intent->purchase_type,
                'platform_rate' => $breakdown->platformRate,
                'vendor_share' => $breakdown->vendorShare,
                'vat_rate' => $breakdown->vatRate,
            ],
        ]);
    }

    public function recordAffiliateExpense(PurchaseIntent $intent, int $amount): Financial
    {
        $existing = Financial::query()
            ->where('direction', FinancialDirection::Expense->value)
            ->where('item_id', $intent->id)
            ->where('payload->reason', 'affiliate_commission')
            ->first();

        if ($existing instanceof Financial) {
            return $existing;
        }

        return Financial::query()->create([
            'direction' => FinancialDirection::Expense,
            'gross_amount' => $amount,
            'vat_amount' => 0,
            'net_amount' => $amount,
            'status' => FinancialStatus::Pending,
            'item_id' => $intent->id,
            'payload' => [
                'purchase_intent_id' => $intent->id,
                'purchase_type' => $intent->purchase_type,
                'reason' => 'affiliate_commission',
            ],
        ]);
    }
}
