<?php

namespace App\Console\Commands;

use App\Enums\ContractStatus;
use App\Models\Contract;
use App\Services\Contracts\ContractSnapshotService;
use Illuminate\Console\Command;

class CreateCompletedContractSnapshots extends Command
{
    protected $signature = 'contracts:snapshot-completed
                            {--dry-run : فقط گزارش بده، بدون ساخت snapshot}
                            {--chunk=200 : تعداد قرارداد در هر batch}';

    protected $description = 'Create integrity snapshots and hashes for completed contracts missing snapshots';

    public function handle(ContractSnapshotService $snapshots): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $chunkSize = max(1, (int) $this->option('chunk'));

        $query = Contract::query()
            ->where('status', ContractStatus::Completed->value)
            ->whereDoesntHave('snapshot')
            ->orderBy('id');

        $total = (clone $query)->count();

        $this->info('وضعیت هدف: '.ContractStatus::Completed->value.' ('.ContractStatus::Completed->label().')');
        $this->info("قراردادهای منعقد شده بدون snapshot: {$total}");

        if ($total === 0) {
            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($total);
        $created = 0;

        $query->chunkById($chunkSize, function ($contracts) use ($snapshots, $dryRun, $bar, &$created): void {
            foreach ($contracts as $contract) {
                if ($dryRun) {
                    $this->line("Contract {$contract->id} => {$contract->status} (".ContractStatus::labelFor($contract->status).')');
                } else {
                    $snapshots->createForContract($contract);
                }

                $created++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info($dryRun ? "Dry run completed. Eligible contracts: {$created}." : "Snapshots created: {$created}.");

        return self::SUCCESS;
    }
}
