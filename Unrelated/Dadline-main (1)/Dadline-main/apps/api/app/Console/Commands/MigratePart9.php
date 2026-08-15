<?php

namespace App\Console\Commands;

use App\Enums\DodbotConversationType;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

class MigratePart9
{
    private const CHUNK_SIZE = 500;

    public function __construct(
        private Command $console
    ) {}

    public function migrateDodbotAi(bool $dryRun): void
    {
        $this->console->info('Migrating Dodbot AI balances, conversations, messages, and purchases...');

        $users = DB::table('users')->pluck('id')->flip();

        $this->migrateBalances($dryRun, $users);
        $this->migrateConversations($dryRun, $users);
        $this->migrateMessages($dryRun);
        $this->migratePurchases($dryRun, $users);
    }

    private function migrateBalances(bool $dryRun, Collection $users): void
    {
        $table = 'ad_dad_ai_tokens';

        if (! $this->legacyTableExists($table)) {
            $this->console->warn("Legacy table was not found: {$table}.");

            return;
        }

        $columns = $this->legacyColumns($table);
        $query = MigrateHelper::legacy($table);
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        foreach ($query->orderBy($this->orderColumn($columns))->cursor() as $row) {
            $userId = $this->integerValue($row, $columns, ['user_id', 'user', 'uid']);

            if ($userId === null || ! $users->has($userId)) {
                $missingUsers++;
                $bar->advance();

                continue;
            }

            $balance = $this->integerValue($row, $columns, [
                'balance',
                'tokens',
                'token',
                'remaining_tokens',
                'remaining',
                'amount',
            ]);

            if ($balance === null || $balance < 0) {
                $invalidRows++;
                $bar->advance();

                continue;
            }

            $updatedAt = $this->dateValue($row, $columns, ['updated_at', 'created_at']) ?? now();

            if ($dryRun) {
                $this->console->line("{$table} user {$userId} => dodbot_balances");
            } else {
                DB::table('dodbot_balances')->updateOrInsert(
                    ['user_id' => $userId],
                    [
                        'balance' => $balance,
                        'updated_at' => $updatedAt,
                    ]
                );
            }

            $migrated++;
            $bar->advance();
        }

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Dodbot balances migrated: {$migrated}.");
        $this->console->warn("Dodbot balances skipped because user was missing: {$missingUsers}.");
        $this->console->warn("Dodbot balances skipped because data was invalid: {$invalidRows}.");
    }

    private function migrateConversations(bool $dryRun, Collection $users): void
    {
        $table = 'ad_dad_ai_conversations';

        if (! $this->legacyTableExists($table)) {
            $this->console->warn("Legacy table was not found: {$table}.");

            return;
        }

        $columns = $this->legacyColumns($table);

        if (! in_array('id', $columns, true)) {
            $this->console->warn("Legacy table {$table} skipped because no id column was found.");

            return;
        }

        $query = MigrateHelper::legacy($table);
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $columns,
            $users,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$invalidRows,
            $bar
        ): void {
            foreach ($rows as $row) {
                $id = $this->positiveInteger($row->id ?? null);
                $userId = $this->integerValue($row, $columns, ['user_id', 'user', 'uid']);

                if ($id === null) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($userId === null || ! $users->has($userId)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                if (DB::table('dodbot_conversations')->where('id', $id)->exists()) {
                    $existing++;
                    $migrated++;
                    $bar->advance();

                    continue;
                }

                $createdAt = $this->dateValue($row, $columns, ['created_at']) ?? now();
                $updatedAt = $this->dateValue($row, $columns, ['updated_at']) ?? $createdAt;

                if ($dryRun) {
                    $this->console->line("ad_dad_ai_conversations {$id} => dodbot_conversations {$id}");
                } else {
                    DB::table('dodbot_conversations')->insert([
                        'id' => $id,
                        'uuid' => $this->stringValue($row, $columns, ['uuid'])
                            ?? $this->deterministicUuid("conversation:{$id}"),
                        'user_id' => $userId,
                        'title' => $this->limitedString($this->stringValue($row, $columns, ['title', 'name', 'subject']), 100),
                        'type' => DodbotConversationType::fromLegacy($this->stringValue($row, $columns, ['type', 'conversation_type', 'service_type']))->value,
                        'model_id' => $this->modelId($this->stringValue($row, $columns, ['ai_model', 'model'])),
                        'status' => $this->conversationStatus($this->stringValue($row, $columns, ['status', 'state'])),
                        'created_at' => $createdAt,
                        'updated_at' => $updatedAt,
                    ]);
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Dodbot conversations migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Dodbot conversations skipped because user was missing: {$missingUsers}.");
        $this->console->warn("Dodbot conversations skipped because data was invalid: {$invalidRows}.");
    }

    private function migrateMessages(bool $dryRun): void
    {
        $table = 'ad_dad_ai_chats';

        if (! $this->legacyTableExists($table)) {
            $this->console->warn("Legacy table was not found: {$table}.");

            return;
        }

        $columns = $this->legacyColumns($table);

        if (! in_array('id', $columns, true)) {
            $this->console->warn("Legacy table {$table} skipped because no id column was found.");

            return;
        }

        $query = MigrateHelper::legacy($table);
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingConversations = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $columns,
            &$migrated,
            &$existing,
            &$missingConversations,
            &$invalidRows,
            $bar
        ): void {
            $conversationIds = $rows
                ->map(fn (object $row): ?int => $this->integerValue($row, $columns, [
                    'conversation_id',
                    'ai_conversation_id',
                    'conv_id',
                ]))
                ->filter()
                ->unique()
                ->values();

            $conversations = DB::table('dodbot_conversations')
                ->whereIn('id', $conversationIds)
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                $id = $this->positiveInteger($row->id ?? null);
                $conversationId = $this->integerValue($row, $columns, [
                    'conversation_id',
                    'ai_conversation_id',
                    'conv_id',
                ]);

                if ($id === null) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($conversationId === null || ! $conversations->has($conversationId)) {
                    $missingConversations++;
                    $bar->advance();

                    continue;
                }

                $inTokens = max($this->integerValue($row, $columns, ['input_tokens', 'input', 'prompt_tokens']) ?? 0, 0);
                $outTokens = max($this->integerValue($row, $columns, ['output_tokens', 'output', 'completion_tokens']) ?? 0, 0);

                if (DB::table('dodbot_messages')->where('id', $id)->exists()) {
                    if (! $dryRun) {
                        DB::table('dodbot_messages')
                            ->where('id', $id)
                            ->update([
                                'in_tokens' => $inTokens,
                                'out_tokens' => $outTokens,
                            ]);
                    }

                    $existing++;
                    $migrated++;
                    $bar->advance();

                    continue;
                }

                $prompt = $this->stringValue($row, $columns, ['prompt', 'question', 'input', 'message', 'msg']);
                $response = $this->stringValue($row, $columns, ['response', 'answer', 'output', 'result', 'content']);

                if ($prompt === null && $response === null) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $createdAt = $this->dateValue($row, $columns, ['created_at']) ?? now();

                if ($dryRun) {
                    $this->console->line("ad_dad_ai_chats {$id} => dodbot_messages {$id}");
                } else {
                    DB::table('dodbot_messages')->insert([
                        'id' => $id,
                        'conversation_id' => $conversationId,
                        'in_tokens' => $inTokens,
                        'out_tokens' => $outTokens,
                        'prompt' => $prompt,
                        'response' => $response,
                        'created_at' => $createdAt,
                    ]);

                    $this->touchConversation($conversationId, $createdAt);
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Dodbot messages migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Dodbot messages skipped because conversation was missing: {$missingConversations}.");
        $this->console->warn("Dodbot messages skipped because data was invalid: {$invalidRows}.");
    }

    private function migratePurchases(bool $dryRun, Collection $users): void
    {
        $table = 'ad_dad_ai_purchases';

        if (! $this->legacyTableExists($table)) {
            $this->console->warn("Legacy table was not found: {$table}.");

            return;
        }

        $columns = $this->legacyColumns($table);

        if (! in_array('id', $columns, true)) {
            $this->console->warn("Legacy table {$table} skipped because no id column was found.");

            return;
        }

        $query = MigrateHelper::legacy($table);
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $missingTransactions = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $columns,
            $users,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$missingTransactions,
            &$invalidRows,
            $bar
        ): void {
            $transactionIds = $rows
                ->map(fn (object $row): ?int => $this->integerValue($row, $columns, [
                    'transaction_id',
                    'wallet_transaction_id',
                    'trn_id',
                    'tx_id',
                ]))
                ->filter()
                ->unique()
                ->values();

            $transactions = DB::table('wallet_transactions')
                ->whereIn('id', $transactionIds)
                ->pluck('user_id', 'id');

            foreach ($rows as $row) {
                $id = $this->positiveInteger($row->id ?? null);
                $transactionId = $this->integerValue($row, $columns, [
                    'transaction_id',
                    'wallet_transaction_id',
                    'trn_id',
                    'tx_id',
                ]);

                if ($id === null) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($transactionId === null || ! $transactions->has($transactionId)) {
                    $missingTransactions++;
                    $bar->advance();

                    continue;
                }

                $userId = $this->integerValue($row, $columns, ['user_id', 'user', 'uid'])
                    ?? (int) $transactions->get($transactionId);

                if (! $users->has($userId)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $tokens = $this->integerValue($row, $columns, ['tokens', 'token', 'amount']);
                $price = $this->integerValue($row, $columns, ['price', 'paid_price', 'pay_price', 'total_price', 'amount_price']);

                if ($tokens === null || $tokens <= 0 || $price === null || $price <= 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if (
                    DB::table('dodbot_purchases')->where('id', $id)->exists()
                    || DB::table('dodbot_purchases')->where('transaction_id', $transactionId)->exists()
                ) {
                    $existing++;
                    $migrated++;
                    $bar->advance();

                    continue;
                }

                $createdAt = $this->dateValue($row, $columns, ['created_at']) ?? now();
                $updatedAt = $this->dateValue($row, $columns, ['updated_at']) ?? $createdAt;

                if ($dryRun) {
                    $this->console->line("ad_dad_ai_purchases {$id} => dodbot_purchases {$id}");
                } else {
                    DB::table('dodbot_purchases')->insert([
                        'id' => $id,
                        'user_id' => $userId,
                        'transaction_id' => $transactionId,
                        'tokens' => $tokens,
                        'price' => $price,
                        'status' => $this->purchaseStatus($this->stringValue($row, $columns, ['status', 'state'])),
                        'created_at' => $createdAt,
                        'updated_at' => $updatedAt,
                    ]);
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Dodbot purchases migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Dodbot purchases skipped because user was missing: {$missingUsers}.");
        $this->console->warn("Dodbot purchases skipped because transaction was missing: {$missingTransactions}.");
        $this->console->warn("Dodbot purchases skipped because data was invalid: {$invalidRows}.");
    }

    private function touchConversation(int $conversationId, CarbonImmutable $messageAt): void
    {
        DB::table('dodbot_conversations')
            ->where('id', $conversationId)
            ->where(fn ($query) => $query
                ->whereNull('updated_at')
                ->orWhere('updated_at', '<', $messageAt))
            ->update(['updated_at' => $messageAt]);
    }

    private function conversationStatus(?string $status): string
    {
        return match (strtolower(trim($status ?? ''))) {
            'closed', 'close', 'finished', 'done', 'inactive' => 'closed',
            default => 'active',
        };
    }

    private function purchaseStatus(?string $status): string
    {
        return match (strtolower(trim($status ?? ''))) {
            'completed', 'complete', 'paid', 'success', 'successful', '1' => 'completed',
            'failed', 'fail', 'cancelled', 'canceled', 'error', '-1' => 'failed',
            default => 'pending',
        };
    }

    private function modelId(?string $value): int
    {
        return match (strtolower(trim($value ?? ''))) {
            'gpt-5.6-luna' => 2,
            'gpt-5.6-terra' => 3,
            'gpt-5.6-sol' => 4,
            'gpt-5.4-mini' => 5,
            'gpt-5.4' => 6,
            'gpt-5.2' => 7,
            'gpt-4.1' => 8,
            'gpt-4o-mini' => 9,
            'claude-sonnet-5' => 10,
            'claude-sonnet-4-6' => 11,
            'claude-3-5-haiku-20241022' => 12,
            'gemini-3.1-pro-preview' => 13,
            'gemini-3.6-flash' => 14,
            'gemini-3.5-flash-lite' => 15,
            'o3' => 16,
            'gpt-5-mini' => 17,
            'gpt-5-nano' => 18,
            'gpt-5.3-codex-spark' => 19,
            'claude-opus-4-1-20250805' => 20,
            'grok-4' => 21,
            'grok-4.3' => 22,
            'gemini-2.5-pro' => 23,
            'gemini-2.5-flash' => 24,
            default => 1,
        };
    }

    private function legacyTableExists(string $table): bool
    {
        return Schema::connection('legacy')->hasTable($table);
    }

    /**
     * @return list<string>
     */
    private function legacyColumns(string $table): array
    {
        return Schema::connection('legacy')->getColumnListing($table);
    }

    private function orderColumn(array $columns): string
    {
        return in_array('id', $columns, true) ? 'id' : 'user_id';
    }

    /**
     * @param  list<string>  $candidates
     */
    private function stringValue(object $row, array $columns, array $candidates): ?string
    {
        foreach ($candidates as $candidate) {
            if (! in_array($candidate, $columns, true) || ! property_exists($row, $candidate)) {
                continue;
            }

            $value = $row->{$candidate};

            if (blank($value)) {
                continue;
            }

            return trim((string) $value);
        }

        return null;
    }

    /**
     * @param  list<string>  $candidates
     */
    private function integerValue(object $row, array $columns, array $candidates): ?int
    {
        foreach ($candidates as $candidate) {
            if (! in_array($candidate, $columns, true) || ! property_exists($row, $candidate)) {
                continue;
            }

            $integer = $this->integer($row->{$candidate});

            if ($integer !== null) {
                return $integer;
            }
        }

        return null;
    }

    /**
     * @param  list<string>  $candidates
     */
    private function dateValue(object $row, array $columns, array $candidates): ?CarbonImmutable
    {
        foreach ($candidates as $candidate) {
            if (! in_array($candidate, $columns, true) || ! property_exists($row, $candidate)) {
                continue;
            }

            $date = $this->legacyDate($row->{$candidate});

            if ($date !== null) {
                return $date;
            }
        }

        return null;
    }

    private function limitedString(?string $value, int $limit): ?string
    {
        return $value === null ? null : Str::limit($value, $limit, '');
    }

    private function positiveInteger(mixed $value): ?int
    {
        $integer = $this->integer($value);

        return $integer !== null && $integer > 0 ? $integer : null;
    }

    private function integer(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_int($value)) {
            return $value;
        }

        if (is_float($value)) {
            return (int) $value;
        }

        $normalized = preg_replace('/[^\d-]/', '', (string) $value);

        if ($normalized === null || $normalized === '' || $normalized === '-') {
            return null;
        }

        return (int) $normalized;
    }

    private function deterministicUuid(string $key): string
    {
        $hex = substr(sha1("dadline-dodbot-ai:{$key}"), 0, 32);
        $hex[12] = '5';
        $hex[16] = dechex((hexdec($hex[16]) & 0x3) | 0x8);

        return sprintf(
            '%s-%s-%s-%s-%s',
            substr($hex, 0, 8),
            substr($hex, 8, 4),
            substr($hex, 12, 4),
            substr($hex, 16, 4),
            substr($hex, 20, 12)
        );
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
