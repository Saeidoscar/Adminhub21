<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\PlatformAlert;
use Illuminate\Console\Command;

class PruneOldNotifications extends Command
{
    protected $signature = 'notifications:prune-old {--days=30}';

    protected $description = 'Prune non-critical in-app notifications and old platform alerts.';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $cutoff = now()->subDays($days);

        $notifications = Notification::query()
            ->where('is_critical', false)
            ->where('created_at', '<', $cutoff)
            ->delete();

        $platformAlerts = PlatformAlert::query()
            ->where('created_at', '<', $cutoff)
            ->delete();

        $this->info("Old notifications pruned: {$notifications}");
        $this->info("Old platform alerts pruned: {$platformAlerts}");

        return self::SUCCESS;
    }
}
