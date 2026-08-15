<?php

namespace App\Console\Commands;

use App\Enums\FinancialDirection;
use App\Enums\FinancialStatus;
use App\Enums\PayoutSettlementStatus;
use App\Enums\WalletPaymentStatus;
use App\Enums\WalletStatus;
use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\Financial;
use App\Models\PayoutSettlement;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\WalletTransactionPayment;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Throwable;

class MigratePart5
{
    private const CHUNK_SIZE = 500;

    public function __construct(
        private Command $console
    ) {}

    public function migrateWallets(bool $dryRun): void
    {
        $this->console->info('Migrating Wallets...');

        $query = MigrateHelper::legacy('ad_dad_wallet');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        $query->orderBy('wallet_id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$invalidRows
        ): void {
            $users = User::query()
                ->whereIn('id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('id')
                ->flip();
            $existingWallets = Wallet::query()
                ->whereIn('user_id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('user_id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingWallets->has($row->user_id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->user_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $balance = (int) ($row->balance ?? 0);

                if ($balance < 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Wallet user {$row->user_id} => balance {$balance}");
                } else {
                    $updatedAt = $this->legacyDate($row->updated_at ?? null) ?? now();
                    $wallet = new Wallet;
                    $wallet->fill([
                        'user_id' => $row->user_id,
                        'balance' => $balance,
                        'blocked_balance' => 0,
                        'withdrawable_balance' => $balance,
                        'status' => WalletStatus::Active,
                    ]);
                    $wallet->created_at = $updatedAt;
                    $wallet->updated_at = $updatedAt;
                    $wallet->save();
                }

                $migrated++;
                $bar->advance();
            }
        }, 'wallet_id');

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Wallets migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Wallets skipped because the user was missing: {$missingUsers}.");
        $this->console->warn("Wallets skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateWalletTransactions(bool $dryRun): void
    {
        $this->console->info('Migrating Wallet Transactions...');

        $query = MigrateHelper::legacy('ad_dad_wallet_transactions');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $createdFallbackWallets = 0;
        $invalidRows = 0;

        $query->orderBy('transaction_id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$createdFallbackWallets,
            &$invalidRows
        ): void {
            $existingIds = WalletTransaction::query()
                ->whereIn('id', $rows->pluck('transaction_id'))
                ->pluck('id')
                ->flip();
            $userIds = $rows->pluck('user_id')->filter()->unique();
            $users = User::query()
                ->whereIn('id', $userIds)
                ->pluck('id')
                ->flip();
            $wallets = Wallet::query()
                ->whereIn('user_id', $userIds)
                ->pluck('user_id')
                ->flip();

            if ($dryRun) {
                $legacyWallets = MigrateHelper::legacy('ad_dad_wallet')
                    ->whereIn('user_id', $userIds)
                    ->pluck('user_id')
                    ->flip();
                $wallets = $wallets->union($legacyWallets);
            }

            foreach ($rows as $row) {
                if ($existingIds->has($row->transaction_id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->user_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $direction = $this->transactionDirection($row->type);
                $status = $this->transactionStatus($row->transaction_status);
                $amount = (int) $row->amount;

                if ($direction === null || $status === null || $amount <= 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if (! $wallets->has($row->user_id)) {
                    if ($dryRun) {
                        $this->console->line("Wallet fallback needed for user {$row->user_id}");
                    } else {
                        Wallet::query()->firstOrCreate(
                            ['user_id' => $row->user_id],
                            [
                                'balance' => 0,
                                'blocked_balance' => 0,
                                'withdrawable_balance' => 0,
                                'status' => WalletStatus::Active,
                            ]
                        );
                    }

                    $wallets->put($row->user_id, $row->user_id);
                    $createdFallbackWallets++;
                }

                if ($dryRun) {
                    $this->console->line("Wallet transaction {$row->transaction_id} => user {$row->user_id}");
                } else {
                    $createdAt = $this->legacyDate($row->created_at ?? null) ?? now();
                    $transaction = new WalletTransaction;
                    $transaction->id = $row->transaction_id;
                    $transaction->fill([
                        'user_id' => $row->user_id,
                        'amount' => $amount,
                        'direction' => $direction,
                        'type' => $this->transactionType($row->sub_type),
                        'status' => $status,
                        'description' => null,
                    ]);
                    $transaction->created_at = $createdAt;
                    $transaction->updated_at = $this->legacyDate($row->updated_at ?? null) ?? $createdAt;
                    $transaction->save();
                }

                $migrated++;
                $bar->advance();
            }
        }, 'transaction_id');

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Wallet transactions migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Wallet transactions skipped because the user was missing: {$missingUsers}.");
        $this->console->warn("Wallet transactions skipped because their data was invalid: {$invalidRows}.");
        $this->console->warn("Fallback zero-balance wallets created for legacy transactions: {$createdFallbackWallets}.");
    }

    public function migrateWalletPayments(bool $dryRun): void
    {
        $this->console->info('Migrating Wallet Payments...');

        $query = MigrateHelper::legacy('ad_dad_wallet_payments');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingTransactions = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingTransactions,
            &$invalidRows
        ): void {
            $existingIds = WalletTransactionPayment::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $transactionIds = $rows->pluck('transaction_id')->filter()->unique();
            $transactions = $dryRun
                ? $this->legacyEligibleTransactions($transactionIds)
                : WalletTransaction::query()
                    ->whereIn('id', $transactionIds)
                    ->get(['id', 'status'])
                    ->keyBy('id');

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                $transaction = $transactions->get($row->transaction_id);

                if ($transaction === null) {
                    $missingTransactions++;
                    $bar->advance();

                    continue;
                }

                $amount = (int) $row->amount;
                $gatewayFee = (int) $row->wage;

                if ($amount <= 0 || $gatewayFee < 0 || blank($row->gateway) || blank($row->ref_num)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Wallet payment {$row->id} => transaction {$row->transaction_id}");
                } else {
                    $createdAt = $this->legacyDate($row->created_at ?? null) ?? now();
                    $payment = new WalletTransactionPayment;
                    $payment->id = $row->id;
                    $payment->fill([
                        'transaction_id' => $row->transaction_id,
                        'gateway' => $row->gateway,
                        'ref_num' => $row->ref_num,
                        'gateway_token' => $row->token,
                        'rrn' => $row->rrn,
                        'terminal_id' => $row->terminal_id,
                        'card_number_masked' => $row->card_number,
                        'amount' => $amount,
                        'gateway_fee' => $gatewayFee,
                        'status' => $this->paymentStatus($row->status, $transaction->status),
                        'verified' => (bool) $row->verified,
                        'verified_at' => (bool) $row->verified ? $createdAt : null,
                    ]);
                    $payment->created_at = $createdAt;
                    $payment->updated_at = $createdAt;
                    $payment->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Wallet payments migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Wallet payments skipped because the transaction was missing: {$missingTransactions}.");
        $this->console->warn("Wallet payments skipped because their data was invalid: {$invalidRows}.");
    }

    public function migratePayoutSettlements(bool $dryRun): void
    {
        $this->console->info('Migrating Payout Settlements...');

        $query = MigrateHelper::legacy('ad_dad_settlements');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingTransactions = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingTransactions,
            &$invalidRows
        ): void {
            $existingIds = PayoutSettlement::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $transactionIds = $rows->pluck('trn_id')->filter()->unique();
            $transactions = $dryRun
                ? $this->legacyEligibleTransactions($transactionIds)
                : WalletTransaction::query()
                    ->whereIn('id', $transactionIds)
                    ->pluck('id')
                    ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $transactions->has($row->trn_id)) {
                    $missingTransactions++;
                    $bar->advance();

                    continue;
                }

                $status = $this->settlementStatus($row->status);
                $amount = (int) $row->amount;
                $fee = (int) $row->fee;
                $totalPayable = $amount - $fee;

                if ($status === null || $amount <= 0 || $fee < 0 || $fee > $amount || blank($row->iban)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Payout settlement {$row->id} => transaction {$row->trn_id}");
                } else {
                    $createdAt = $this->legacyDate($row->created_at ?? null) ?? now();
                    $settlement = new PayoutSettlement;
                    $settlement->id = $row->id;
                    $settlement->fill([
                        'transaction_id' => $row->trn_id,
                        'amount' => $amount,
                        'fee' => $fee,
                        'total_payable' => $totalPayable,
                        'iban' => $row->iban,
                        'receipt_link' => $row->receipt,
                        'track_id' => $row->track_id === null ? null : (string) $row->track_id,
                        'status' => $status,
                        'paid_at' => $this->legacyDate($row->deposit_at ?? null),
                        'failed_reason' => null,
                    ]);
                    $settlement->created_at = $createdAt;
                    $settlement->updated_at = $this->legacyDate($row->updated_at ?? null) ?? $createdAt;
                    $settlement->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Payout settlements migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Payout settlements skipped because the transaction was missing: {$missingTransactions}.");
        $this->console->warn("Payout settlements skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateFinancials(bool $dryRun): void
    {
        if (! $dryRun && Financial::query()->exists()) {
            $this->console->warn('Financials migration skipped because the financials table already has rows.');

            return;
        }

        $this->migrateLegacyFinancialTable('ad_dad_income', FinancialDirection::Income, $dryRun);
        $this->migrateLegacyFinancialTable('ad_dad_cost', FinancialDirection::Expense, $dryRun);
    }

    public function migrateAffiliates(bool $dryRun): void
    {
        $this->console->info('Migrating Affiliates...');

        if (! Schema::connection('legacy')->hasTable('ad_dad_marketers')) {
            $this->console->warn('Legacy table ad_dad_marketers was not found.');

            return;
        }

        $columns = Schema::connection('legacy')->getColumnListing('ad_dad_marketers');

        if ($this->firstExistingColumn($columns, ['id']) === null
            || $this->firstExistingColumn($columns, ['user_id']) === null
            || $this->firstExistingColumn($columns, ['referral_code']) === null) {
            $this->console->warn('Legacy table ad_dad_marketers skipped because required columns were not found.');

            return;
        }

        $query = MigrateHelper::legacy('ad_dad_marketers');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            $columns,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$invalidRows
        ): void {
            $existingIds = Affiliate::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $existingCodes = Affiliate::query()
                ->whereIn('referral_code', $rows->pluck('referral_code')->filter()->unique())
                ->pluck('referral_code')
                ->flip();
            $existingUsers = Affiliate::query()
                ->whereIn('user_id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('user_id')
                ->flip();
            $users = User::query()
                ->whereIn('id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id) || $existingCodes->has($row->referral_code) || $existingUsers->has($row->user_id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->user_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $rate = $this->affiliateRate($row->rate ?? null);
                $status = $this->affiliateStatus($row->status ?? null);

                if (blank($row->referral_code) || $rate === null || $status === null) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Affiliate {$row->id} => user {$row->user_id}");
                } else {
                    $createdAt = $this->legacyDateField($row, $columns, ['created_at']) ?? now();
                    $affiliate = new Affiliate;
                    $affiliate->id = $row->id;
                    $affiliate->fill([
                        'user_id' => $row->user_id,
                        'referral_code' => substr((string) $row->referral_code, 0, 32),
                        'commission_rate' => $rate,
                        'status' => $status,
                    ]);
                    $affiliate->created_at = $createdAt;
                    $affiliate->updated_at = $this->legacyDateField($row, $columns, ['updated_at']) ?? $createdAt;
                    $affiliate->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Affiliates migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Affiliates skipped because the user was missing: {$missingUsers}.");
        $this->console->warn("Affiliates skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateAffiliateCommissions(bool $dryRun): void
    {
        $this->console->info('Migrating Affiliate Commissions...');

        if (! Schema::connection('legacy')->hasTable('ad_dad_affiliate_sales')) {
            $this->console->warn('Legacy table ad_dad_affiliate_sales was not found.');

            return;
        }

        $columns = Schema::connection('legacy')->getColumnListing('ad_dad_affiliate_sales');
        $idColumn = $this->firstExistingColumn($columns, ['id', 'sale_id', 'affiliate_sale_id']);
        $affiliateColumn = $this->firstExistingColumn($columns, ['affiliate_id', 'marketer_id']);
        $sourceTxColumn = $this->firstExistingColumn($columns, ['transaction_id', 'trn_id', 'source_tx_id', 'source_transaction_id']);
        $commissionTxColumn = $this->firstExistingColumn($columns, ['commission_tx_id', 'wallet_transaction_id', 'pay_transaction_id']);
        $rateColumn = $this->firstExistingColumn($columns, ['rate', 'commission_rate', 'percent', 'percentage']);
        $amountColumn = $this->firstExistingColumn($columns, ['amount', 'commission_amount', 'commission', 'income', 'price']);

        if ($idColumn === null || $affiliateColumn === null || $sourceTxColumn === null || $amountColumn === null) {
            $this->console->warn('Legacy table ad_dad_affiliate_sales skipped because required columns were not found. Columns: '.implode(', ', $columns));

            return;
        }

        $query = MigrateHelper::legacy('ad_dad_affiliate_sales');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingAffiliates = 0;
        $missingSourceTransactions = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            $columns,
            $idColumn,
            $affiliateColumn,
            $sourceTxColumn,
            $commissionTxColumn,
            $rateColumn,
            $amountColumn,
            &$migrated,
            &$existing,
            &$missingAffiliates,
            &$missingSourceTransactions,
            &$invalidRows
        ): void {
            $existingIds = AffiliateCommission::query()
                ->whereIn('id', $rows->pluck($idColumn))
                ->pluck('id')
                ->flip();
            $existingSources = AffiliateCommission::query()
                ->whereIn('source_tx_id', $rows->pluck($sourceTxColumn)->filter()->unique())
                ->pluck('source_tx_id')
                ->flip();
            $legacyAffiliateIds = $rows->pluck($affiliateColumn)->filter()->unique();
            $affiliatesById = Affiliate::query()
                ->whereIn('id', $legacyAffiliateIds)
                ->get(['id', 'user_id', 'commission_rate'])
                ->keyBy('id');
            $affiliatesByUserId = Affiliate::query()
                ->whereIn('user_id', $legacyAffiliateIds)
                ->get(['id', 'user_id', 'commission_rate'])
                ->keyBy('user_id');
            $sourceTransactions = $dryRun
                ? $this->legacyEligibleTransactions($rows->pluck($sourceTxColumn)->filter()->unique())
                : WalletTransaction::query()
                    ->whereIn('id', $rows->pluck($sourceTxColumn)->filter()->unique())
                    ->pluck('id')
                    ->flip();
            $commissionTransactions = collect();

            if ($commissionTxColumn !== null) {
                $commissionTxIds = $rows->pluck($commissionTxColumn)->filter()->unique();
                $commissionTransactions = $dryRun
                    ? $this->legacyEligibleTransactions($commissionTxIds)
                    : WalletTransaction::query()
                        ->whereIn('id', $commissionTxIds)
                        ->pluck('id')
                        ->flip();
            }

            foreach ($rows as $row) {
                $id = (int) $row->{$idColumn};
                $sourceTxId = (int) $row->{$sourceTxColumn};

                if ($existingIds->has($id) || $existingSources->has($sourceTxId)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                $legacyAffiliateId = $row->{$affiliateColumn};
                $affiliate = $affiliatesById->get($legacyAffiliateId) ?? $affiliatesByUserId->get($legacyAffiliateId);

                if ($affiliate === null) {
                    $missingAffiliates++;
                    $bar->advance();

                    continue;
                }

                if (! $sourceTransactions->has($sourceTxId)) {
                    $missingSourceTransactions++;
                    $bar->advance();

                    continue;
                }

                $commissionTxId = $commissionTxColumn === null || blank($row->{$commissionTxColumn} ?? null)
                    ? null
                    : (int) $row->{$commissionTxColumn};

                if ($commissionTxId !== null && (! $commissionTransactions->has($commissionTxId) || $commissionTxId === $sourceTxId)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $rate = $this->affiliateRate($rateColumn === null ? null : ($row->{$rateColumn} ?? null)) ?? (string) $affiliate->commission_rate;
                $status = $this->affiliateCommissionStatus($row->status ?? null);
                $amount = (int) $row->{$amountColumn};

                if ($rate === null || $status === null || $amount <= 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Affiliate commission {$id} => source tx {$sourceTxId}");
                } else {
                    $createdAt = $this->legacyDateField($row, $columns, ['created_at']) ?? now();
                    $commission = new AffiliateCommission;
                    $commission->id = $id;
                    $commission->fill([
                        'affiliate_id' => $affiliate->id,
                        'source_tx_id' => $sourceTxId,
                        'commission_tx_id' => $commissionTxId,
                        'rate' => $rate,
                        'amount' => $amount,
                        'status' => $status,
                    ]);
                    $commission->created_at = $createdAt;
                    $commission->updated_at = $this->legacyDateField($row, $columns, ['updated_at']) ?? $createdAt;
                    $commission->save();
                }

                $migrated++;
                $bar->advance();
            }
        }, $idColumn);

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Affiliate commissions migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Affiliate commissions skipped because affiliates were missing: {$missingAffiliates}.");
        $this->console->warn("Affiliate commissions skipped because source transactions were missing: {$missingSourceTransactions}.");
        $this->console->warn("Affiliate commissions skipped because their data was invalid: {$invalidRows}.");
    }

    private function migrateLegacyFinancialTable(string $legacyTable, FinancialDirection $direction, bool $dryRun): void
    {
        $this->console->info("Migrating {$legacyTable}...");

        if (! Schema::connection('legacy')->hasTable($legacyTable)) {
            $this->console->warn("Legacy table {$legacyTable} was not found.");

            return;
        }

        $columns = Schema::connection('legacy')->getColumnListing($legacyTable);
        $idColumn = $this->firstExistingColumn($columns, ['id', 'income_id', 'cost_id']);

        if ($idColumn === null) {
            $this->console->warn("Legacy table {$legacyTable} skipped because no id column was found.");

            return;
        }

        $query = MigrateHelper::legacy($legacyTable);
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $invalidRows = 0;

        $query->orderBy($idColumn)->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            $legacyTable,
            $direction,
            $columns,
            $idColumn,
            &$migrated,
            &$invalidRows
        ): void {
            foreach ($rows as $row) {
                $legacyId = (string) $row->{$idColumn};

                $grossAmount = $this->legacyIntegerField($row, $columns, [
                    'gross_amount',
                    'amount',
                    'price',
                    'total_amount',
                    'total_price',
                    'total',
                    'value',
                    'income_amount',
                    'cost_amount',
                    'cost',
                ]);
                $vatAmount = $this->legacyIntegerField($row, $columns, [
                    'vat_amount',
                    'vat',
                    'tax_amount',
                    'tax',
                ]) ?? 0;
                $netAmount = $this->legacyIntegerField($row, $columns, [
                    'net_amount',
                    'net',
                    'final_amount',
                    'final_price',
                ]) ?? ($vatAmount > 0 ? max(0, ($grossAmount ?? 0) - $vatAmount) : $grossAmount);

                if ($grossAmount === null || $netAmount === null || $grossAmount < 0 || $vatAmount < 0 || $netAmount < 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $occurredAt = $this->legacyDateField($row, $columns, [
                    'occurred_at',
                    'paid_at',
                    'date',
                    'created_at',
                    'updated_at',
                ]) ?? now();
                $itemId = $this->legacyIntegerField($row, $columns, [
                    'item_id',
                    'order_id',
                    'service_id',
                    'subscription_id',
                    'product_id',
                    'post_id',
                    'user_id',
                ]);
                $payload = $this->financialPayload($row, $columns, $direction);

                if ($dryRun) {
                    $this->console->line("Financial {$legacyTable}:{$legacyId} => {$direction->value} {$netAmount}");
                } else {
                    $financial = new Financial;
                    $financial->fill([
                        'direction' => $direction,
                        'gross_amount' => $grossAmount,
                        'vat_amount' => $vatAmount,
                        'net_amount' => $netAmount,
                        'status' => $this->financialStatus($this->legacyStringField($row, $columns, ['status', 'state'])),
                        'item_id' => $itemId,
                        'payload' => $payload,
                        'occurred_at' => $occurredAt,
                    ]);
                    $financial->created_at = $this->legacyDateField($row, $columns, ['created_at', 'date']) ?? $occurredAt;
                    $financial->updated_at = $this->legacyDateField($row, $columns, ['updated_at', 'created_at', 'date']) ?? $occurredAt;
                    $financial->save();
                }

                $migrated++;
                $bar->advance();
            }
        }, $idColumn);

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Financial rows migrated from {$legacyTable}: {$migrated}.");
        $this->console->warn("Financial rows skipped from {$legacyTable} because their data was invalid: {$invalidRows}.");
    }

    private function transactionDirection(?string $type): ?WalletTransactionDirection
    {
        return match ($type) {
            'deposit' => WalletTransactionDirection::Deposit,
            'withdrawal' => WalletTransactionDirection::Withdrawal,
            default => null,
        };
    }

    private function transactionStatus(?string $status): ?WalletTransactionStatus
    {
        return match ($status) {
            'completed' => WalletTransactionStatus::Completed,
            'pending' => WalletTransactionStatus::Pending,
            'failed' => WalletTransactionStatus::Failed,
            'returned' => WalletTransactionStatus::Reversed,
            default => null,
        };
    }

    private function transactionType(?string $subType): ?WalletTransactionType
    {
        $type = match (trim((string) $subType)) {
            'service_canceled' => WalletTransactionType::CancelService->value,
            'submit_doc' => WalletTransactionType::SubmitLegalDocCost->value,
            'qanswer' => WalletTransactionType::SubmitAnswerOnQuestion->value,
            default => trim((string) $subType),
        };

        return WalletTransactionType::tryFrom($type);
    }

    private function paymentStatus(mixed $status, WalletTransactionStatus $transactionStatus): WalletPaymentStatus
    {
        if ($transactionStatus === WalletTransactionStatus::Failed) {
            return WalletPaymentStatus::Failed;
        }

        return match ((string) $status) {
            '1', '2' => WalletPaymentStatus::Completed,
            default => WalletPaymentStatus::Pending,
        };
    }

    private function settlementStatus(?string $status): ?PayoutSettlementStatus
    {
        return match ($status) {
            'completed' => PayoutSettlementStatus::Completed,
            'failed' => PayoutSettlementStatus::Failed,
            'pending' => PayoutSettlementStatus::Pending,
            'processing' => PayoutSettlementStatus::Processing,
            'cancelled', 'canceled' => PayoutSettlementStatus::Cancelled,
            default => null,
        };
    }

    private function financialStatus(?string $status): FinancialStatus
    {
        return match (strtolower(trim((string) $status))) {
            'pending' => FinancialStatus::Pending,
            'returned', 'refunded', 'refund' => FinancialStatus::Returned,
            'cancelled', 'canceled', 'cancel' => FinancialStatus::Canceled,
            default => FinancialStatus::Accepted,
        };
    }

    private function affiliateStatus(?string $status): ?string
    {
        return match (strtolower(trim((string) $status))) {
            '', 'active' => 'active',
            'deactivate', 'deactivated' => 'deactivated',
            'banned' => 'banned',
            default => null,
        };
    }

    private function affiliateCommissionStatus(?string $status): ?string
    {
        return match (strtolower(trim((string) $status))) {
            '', 'paid' => 'paid',
            'pending' => 'pending',
            'approved' => 'approved',
            'reversed' => 'reversed',
            default => null,
        };
    }

    private function affiliateRate(mixed $rate): ?string
    {
        if (blank($rate)) {
            return '0.1000';
        }

        $value = (float) str_replace([',', ' '], '', (string) $rate);

        if ($value > 1 && $value <= 100) {
            $value /= 100;
        }

        if ($value < 0 || $value > 1) {
            return null;
        }

        return number_format($value, 4, '.', '');
    }

    /**
     * @param  list<string>  $columns
     * @param  list<string>  $candidates
     */
    private function firstExistingColumn(array $columns, array $candidates): ?string
    {
        foreach ($candidates as $candidate) {
            if (in_array($candidate, $columns, true)) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * @param  list<string>  $columns
     * @param  list<string>  $candidates
     */
    private function legacyIntegerField(object $row, array $columns, array $candidates): ?int
    {
        foreach ($candidates as $candidate) {
            if (! in_array($candidate, $columns, true) || blank($row->{$candidate} ?? null)) {
                continue;
            }

            $value = str_replace([',', ' '], '', (string) $row->{$candidate});

            if (is_numeric($value)) {
                return (int) $value;
            }
        }

        return null;
    }

    /**
     * @param  list<string>  $columns
     * @param  list<string>  $candidates
     */
    private function legacyStringField(object $row, array $columns, array $candidates): ?string
    {
        foreach ($candidates as $candidate) {
            if (in_array($candidate, $columns, true) && filled($row->{$candidate} ?? null)) {
                return trim((string) $row->{$candidate});
            }
        }

        return null;
    }

    /**
     * @param  list<string>  $columns
     * @param  list<string>  $candidates
     */
    private function legacyDateField(object $row, array $columns, array $candidates): ?CarbonImmutable
    {
        foreach ($candidates as $candidate) {
            if (! in_array($candidate, $columns, true)) {
                continue;
            }

            $date = $this->legacyDate($row->{$candidate} ?? null);

            if ($date !== null) {
                return $date;
            }
        }

        return null;
    }

    /**
     * @param  list<string>  $columns
     * @return array<string, mixed>
     */
    private function financialPayload(
        object $row,
        array $columns,
        FinancialDirection $direction
    ): array {
        $payload = [
            'type' => $this->legacyStringField($row, $columns, [
                'type',
                'income_type',
                'cost_type',
                'category',
                'source',
                'subject',
            ]) ?? $direction->value,
            'note' => $this->legacyStringField($row, $columns, [
                'description',
                'desc',
                'note',
                'comment',
                'title',
                'name',
            ]),
        ];

        if (in_array('cost_type', $columns, true) && filled($row->cost_type ?? null)) {
            $payload['cost_type'] = $row->cost_type;
        }

        return array_filter($payload, fn (mixed $value): bool => $value !== null && $value !== '');
    }

    /**
     * @param  Collection<int, mixed>  $transactionIds
     * @return Collection<int, object{id:int,status:WalletTransactionStatus}>
     */
    private function legacyEligibleTransactions(Collection $transactionIds): Collection
    {
        if ($transactionIds->isEmpty()) {
            return collect();
        }

        $rows = MigrateHelper::legacy('ad_dad_wallet_transactions')
            ->whereIn('transaction_id', $transactionIds)
            ->get(['transaction_id', 'user_id', 'amount', 'type', 'transaction_status']);
        $users = User::query()
            ->whereIn('id', $rows->pluck('user_id')->filter()->unique())
            ->pluck('id')
            ->flip();

        return $rows
            ->filter(fn (object $row): bool => $users->has($row->user_id)
                && (int) $row->amount > 0
                && $this->transactionDirection($row->type) !== null
                && $this->transactionStatus($row->transaction_status) !== null)
            ->mapWithKeys(fn (object $row): array => [
                $row->transaction_id => (object) [
                    'id' => (int) $row->transaction_id,
                    'status' => $this->transactionStatus($row->transaction_status),
                ],
            ]);
    }

    private function legacyDate(mixed $value): ?CarbonImmutable
    {
        if (blank($value) || str_starts_with((string) $value, '0000-00-00')) {
            return null;
        }

        try {
            return CarbonImmutable::parse($value);
        } catch (Throwable) {
            return null;
        }
    }
}
