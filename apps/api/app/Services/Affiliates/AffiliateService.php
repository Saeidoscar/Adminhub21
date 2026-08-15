<?php

namespace App\Services\Affiliates;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Actions\Affiliates\GenerateReferralCodeAction;
use App\Actions\Affiliates\TrackCommissionAction;
use App\Actions\Affiliates\ApproveCommissionAction;

class AffiliateService
{
    public function __construct(
        private readonly GenerateReferralCodeAction $generateCode,
        private readonly TrackCommissionAction $trackCommission,
        private readonly ApproveCommissionAction $approveCommission,
    ) {}

    public function ensureAffiliate(User $user): Affiliate
    {
        return Affiliate::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['referral_code' => strtoupper(bin2hex(random_bytes(3))), 'commission_rate' => '0.1000', 'status' => 'active']
        );
    }

    public function generateCode(User $user): Affiliate
    {
        return $this->generateCode->execute($user);
    }

    public function trackCommission(WalletTransaction $sourceTransaction): ?AffiliateCommission
    {
        $affiliate = Affiliate::query()->where('user_id', $sourceTransaction->user_id)->first();

        if ($affiliate === null) {
            return null;
        }

        return $this->trackCommission->execute($affiliate, $sourceTransaction);
    }

    public function approveCommission(AffiliateCommission $commission): AffiliateCommission
    {
        return $this->approveCommission->execute($commission);
    }
}
