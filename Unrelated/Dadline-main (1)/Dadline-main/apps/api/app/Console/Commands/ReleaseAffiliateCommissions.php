<?php

namespace App\Console\Commands;

use App\Models\AffiliateCommission;
use App\Services\Purchases\AffiliateCommissionService;
use Illuminate\Console\Command;

class ReleaseAffiliateCommissions extends Command
{
    protected $signature = 'affiliate-commissions:release-ready {--limit=100}';

    protected $description = 'Release blocked affiliate commissions after their cancellation window expires.';

    public function handle(AffiliateCommissionService $commissions): int
    {
        $released = 0;

        AffiliateCommission::query()
            ->where('status', 'pending')
            ->whereNotNull('release_at')
            ->where('release_at', '<=', now())
            ->with('commissionTransaction.user')
            ->orderBy('release_at')
            ->limit((int) $this->option('limit'))
            ->get()
            ->each(function (AffiliateCommission $commission) use ($commissions, &$released): void {
                $commissions->release($commission);
                $released++;
            });

        $this->info("Released {$released} affiliate commission(s).");

        return self::SUCCESS;
    }
}
