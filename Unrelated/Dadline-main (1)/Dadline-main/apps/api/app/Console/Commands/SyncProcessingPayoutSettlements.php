<?php

namespace App\Console\Commands;

use App\Enums\PayoutSettlementStatus;
use App\Jobs\Settlements\InquirePayoutSettlementJob;
use App\Models\PayoutSettlement;
use App\Services\ExternalServices\OptionServiceSettings;
use Illuminate\Console\Command;

class SyncProcessingPayoutSettlements extends Command
{
    protected $signature = 'settlements:sync-processing {--limit=200}';

    protected $description = 'Queue status inquiries for processing payout settlements.';

    public function handle(OptionServiceSettings $settings): int
    {
        $interval = max(1, $settings->integer('zibal_ebank_inquiry_interval_minutes', 10));
        $count = 0;

        PayoutSettlement::query()
            ->where('status', PayoutSettlementStatus::Processing->value)
            ->where(function ($query) use ($interval): void {
                $query->whereNull('last_checked_at')
                    ->orWhere('last_checked_at', '<=', now()->subMinutes($interval));
            })
            ->orderBy('id')
            ->limit(max(1, (int) $this->option('limit')))
            ->pluck('id')
            ->each(function (int $settlementId) use (&$count, $interval): void {
                $claimed = PayoutSettlement::query()
                    ->whereKey($settlementId)
                    ->where('status', PayoutSettlementStatus::Processing->value)
                    ->where(function ($query) use ($interval): void {
                        $query->whereNull('last_checked_at')
                            ->orWhere('last_checked_at', '<=', now()->subMinutes($interval));
                    })
                    ->update([
                        'last_checked_at' => now(),
                        'updated_at' => now(),
                    ]);

                if ($claimed === 1) {
                    InquirePayoutSettlementJob::dispatch($settlementId);
                    $count++;
                }
            });

        $this->info("Queued {$count} payout inquiry job(s).");

        return self::SUCCESS;
    }
}
