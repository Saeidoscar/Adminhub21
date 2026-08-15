<?php

namespace App\Console\Commands;

use App\Services\Settlements\PayoutSettlementService;
use Illuminate\Console\Command;

class DispatchMonthlyPayoutSettlements extends Command
{
    protected $signature = 'settlements:dispatch-monthly {--force} {--limit=500}';

    protected $description = 'Dispatch pending non-subscriber payouts on the final day of the Persian month.';

    public function handle(PayoutSettlementService $settlements): int
    {
        $count = $settlements->dispatchMonthly(
            (int) $this->option('limit'),
            (bool) $this->option('force'),
        );
        $this->info("Dispatched {$count} monthly payout settlement(s).");

        return self::SUCCESS;
    }
}
