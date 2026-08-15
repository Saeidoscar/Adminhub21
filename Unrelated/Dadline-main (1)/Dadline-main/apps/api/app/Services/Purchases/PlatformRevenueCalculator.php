<?php

namespace App\Services\Purchases;

use App\Enums\UserSubscriptionPlan;
use App\Models\Option;
use App\Models\User;

class PlatformRevenueCalculator
{
    public function forVendorPurchase(int $amount, ?User $vendor, string $shareOption = 'vendor_share'): PlatformRevenueBreakdown
    {
        $vendorShareRate = $this->vendorShareRate($vendor, $shareOption);
        $platformRate = max(0.0, min(1.0, 1.0 - $vendorShareRate));
        $grossCommission = (int) round($amount * $platformRate);
        $vatRate = $this->rate('vat_percent', 0.10);
        $netIncome = $vatRate > 0
            ? (int) round($grossCommission / (1 + $vatRate))
            : $grossCommission;

        return new PlatformRevenueBreakdown(
            grossCommission: $grossCommission,
            netIncome: $netIncome,
            vatAmount: max(0, $grossCommission - $netIncome),
            vendorShare: max(0, $amount - $grossCommission),
            platformRate: $platformRate,
            vatRate: $vatRate
        );
    }

    public function forPlatformPurchase(int $amount): PlatformRevenueBreakdown
    {
        $vatRate = $this->rate('vat_percent', 0.10);
        $netIncome = $vatRate > 0 ? (int) round($amount / (1 + $vatRate)) : $amount;

        return new PlatformRevenueBreakdown(
            grossCommission: $amount,
            netIncome: $netIncome,
            vatAmount: max(0, $amount - $netIncome),
            vendorShare: 0,
            platformRate: 1.0,
            vatRate: $vatRate
        );
    }

    private function vendorShareRate(?User $vendor, string $shareOption): float
    {
        if ($vendor !== null && $this->hasActivePremiumSubscription($vendor)) {
            return $this->rate('pro_vendor_share', 0.80);
        }

        return $this->rate($shareOption, 0.70);
    }

    private function hasActivePremiumSubscription(User $vendor): bool
    {
        $subscription = $vendor->subscription;

        return $subscription !== null
            && $subscription->plan === UserSubscriptionPlan::Premium
            && $subscription->active();
    }

    private function rate(string $key, float $default): float
    {
        $value = Option::get($key, (string) $default);
        $rate = is_numeric($value) ? (float) $value : $default;

        if ($rate > 1) {
            $rate /= 100;
        }

        return max(0.0, min(1.0, $rate));
    }
}
