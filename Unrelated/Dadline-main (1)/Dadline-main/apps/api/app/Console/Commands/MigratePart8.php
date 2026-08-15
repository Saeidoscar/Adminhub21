<?php

namespace App\Console\Commands;

use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

class MigratePart8
{
    private const CHUNK_SIZE = 500;

    private int $dryRunId = 0;

    public function __construct(
        private Command $console
    ) {}

    public function migrateServiceMarketplace(bool $dryRun): void
    {
        $this->console->info('Migrating service marketplace requests, offers, results, and conversations...');

        $users = DB::table('users')->pluck('id')->flip();
        $categories = DB::table('legal_categories')->pluck('id', 'slug');
        $attachmentIds = DB::table('attachments')->pluck('id')->flip();
        $attachmentsByStorageKey = DB::table('attachments')->pluck('id', 'storage_key');

        $requestMap = $this->migrateServiceRequests($dryRun, $users, $categories, $attachmentIds, $attachmentsByStorageKey);
        $offerMap = $this->migrateServiceOffers($dryRun, $requestMap, $users);

        $this->syncAcceptedOffers($dryRun, $requestMap, $offerMap);
        $this->migrateServiceResults($dryRun, $requestMap, $users);
        $this->migrateServiceChats($dryRun, $requestMap, $users, $attachmentIds, $attachmentsByStorageKey);
        $this->migrateSubscriptionChats($dryRun, $users, $attachmentIds, $attachmentsByStorageKey);
    }

    /**
     * @return array<string, int>
     */
    private function migrateServiceRequests(
        bool $dryRun,
        Collection $users,
        Collection $categories,
        Collection $attachmentIds,
        Collection $attachmentsByStorageKey
    ): array {
        $map = [];
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $missingCategories = 0;
        $invalidRows = 0;
        $missingFiles = 0;

        foreach ($this->requestSources() as $source) {
            if (! $this->legacyTableExists($source['table'])) {
                $this->console->warn("Legacy table was not found: {$source['table']}.");

                continue;
            }

            $query = MigrateHelper::legacy($source['table']);
            $bar = $this->console->getOutput()->createProgressBar($query->count());

            $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
                $dryRun,
                $users,
                $categories,
                $attachmentIds,
                $attachmentsByStorageKey,
                $source,
                &$map,
                &$migrated,
                &$existing,
                &$missingUsers,
                &$missingCategories,
                &$invalidRows,
                &$missingFiles,
                $bar
            ): void {
                foreach ($rows as $row) {
                    $key = $this->legacyKey($source['table'], $row->id);

                    if (! $users->has($row->{$source['user']})) {
                        $missingUsers++;
                        $bar->advance();

                        continue;
                    }

                    $status = $this->serviceRequestStatus($row->status ?? null);
                    $title = trim((string) ($row->{$source['title']} ?? ''));

                    if ($status === null || $title === '') {
                        $invalidRows++;
                        $bar->advance();

                        continue;
                    }

                    $categorySlug = trim((string) ($row->{$source['category']} ?? ''));
                    $categoryId = $categorySlug === '' ? null : $categories->get($categorySlug);

                    if ($categorySlug !== '' && $categoryId === null) {
                        $missingCategories++;
                    }

                    $uuid = $this->deterministicUuid($key);
                    $requestId = DB::table('service_requests')->where('uuid', $uuid)->value('id');

                    if ($requestId !== null) {
                        $existing++;
                    } elseif ($dryRun) {
                        $requestId = $this->nextDryRunId();
                        $this->console->line("{$source['table']} {$row->id} => service_requests {$requestId}");
                    } else {
                        $createdAt = $this->legacyDate($row->created_at ?? null) ?? now();
                        $requestId = DB::table('service_requests')->insertGetId([
                            'uuid' => $uuid,
                            'requester_id' => $row->{$source['user']},
                            'category_id' => $categoryId,
                            'type' => $source['type'],
                            'vendor_type' => $this->requestVendorType($source['type'], $row),
                            'title' => Str::limit($title, 500, ''),
                            'description' => (string) ($row->{$source['description']} ?? ''),
                            'details' => $this->encodeJson($this->requestDetails($source['type'], $row)),
                            'status' => $status,
                            'created_at' => $createdAt,
                            'updated_at' => $this->legacyDate($row->updated_at ?? null) ?? $createdAt,
                        ]);
                    }

                    $map[$key] = (int) $requestId;
                    $missingFiles += $this->migrateServiceAttachments(
                        $dryRun,
                        (int) $requestId,
                        $row->{$source['files']} ?? null,
                        $attachmentIds,
                        $attachmentsByStorageKey
                    );
                    $migrated++;
                    $bar->advance();
                }
            });

            $bar->finish();
            $this->console->newLine();
        }

        $this->console->info("Service requests migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Service requests skipped because the requester was missing: {$missingUsers}.");
        $this->console->warn("Service requests had missing categories and were kept with category_id=null: {$missingCategories}.");
        $this->console->warn("Service request files not found in attachments: {$missingFiles}.");
        $this->console->warn("Service requests skipped because their data was invalid: {$invalidRows}.");

        return $map;
    }

    /**
     * @param  array<string, int>  $requestMap
     * @return array<string, int>
     */
    private function migrateServiceOffers(bool $dryRun, array $requestMap, Collection $users): array
    {
        $map = [];
        $migrated = 0;
        $existing = 0;
        $missingRequests = 0;
        $missingUsers = 0;
        $missingTransactions = 0;
        $invalidRows = 0;

        foreach ($this->offerSources() as $source) {
            if (! $this->legacyTableExists($source['table'])) {
                $this->console->warn("Legacy table was not found: {$source['table']}.");

                continue;
            }

            $query = MigrateHelper::legacy($source['table']);
            $bar = $this->console->getOutput()->createProgressBar($query->count());

            $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
                $dryRun,
                $source,
                $requestMap,
                $users,
                &$map,
                &$migrated,
                &$existing,
                &$missingRequests,
                &$missingUsers,
                &$missingTransactions,
                &$invalidRows,
                $bar
            ): void {
                foreach ($rows as $row) {
                    $requestId = $requestMap[$this->legacyKey($source['request_table'], $row->{$source['request_fk']})] ?? null;

                    if ($requestId === null) {
                        $missingRequests++;
                        $bar->advance();

                        continue;
                    }

                    if (! $users->has($row->vendor_id)) {
                        $missingUsers++;
                        $bar->advance();

                        continue;
                    }

                    $status = $this->serviceOfferStatus($row->status ?? null);
                    $price = (int) ($row->price ?? 0);

                    if ($status === null || $price < 0) {
                        $invalidRows++;
                        $bar->advance();

                        continue;
                    }

                    $transactionId = $this->walletTransactionId($row->trn_id ?? null);

                    if (($row->trn_id ?? null) !== null && $transactionId === null) {
                        $missingTransactions++;
                    }

                    $offerId = DB::table('service_offers')
                        ->where('request_id', $requestId)
                        ->where('vendor_id', $row->vendor_id)
                        ->value('id');

                    if ($offerId !== null) {
                        $existing++;
                    } elseif ($dryRun) {
                        $offerId = $this->nextDryRunId();
                        $this->console->line("{$source['table']} {$row->id} => service_offers {$offerId}");
                    } else {
                        $createdAt = $this->legacyDate($row->created_at ?? null) ?? now();
                        $offerId = DB::table('service_offers')->insertGetId([
                            'request_id' => $requestId,
                            'vendor_id' => $row->vendor_id,
                            'price' => $price,
                            'description' => (string) ($row->description ?? ''),
                            'transaction_id' => $transactionId,
                            'status' => $status,
                            'created_at' => $createdAt,
                            'updated_at' => $this->legacyDate($row->updated_at ?? null) ?? $createdAt,
                        ]);
                    }

                    $map[$this->legacyKey($source['table'], $row->id)] = (int) $offerId;
                    $migrated++;
                    $bar->advance();
                }
            });

            $bar->finish();
            $this->console->newLine();
        }

        $this->console->info("Service offers migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Service offers skipped because the request was missing: {$missingRequests}.");
        $this->console->warn("Service offers skipped because the vendor was missing: {$missingUsers}.");
        $this->console->warn("Service offers kept without transaction_id because it was missing: {$missingTransactions}.");
        $this->console->warn("Service offers skipped because their data was invalid: {$invalidRows}.");

        return $map;
    }

    /**
     * @param  array<string, int>  $requestMap
     * @param  array<string, int>  $offerMap
     */
    private function syncAcceptedOffers(bool $dryRun, array $requestMap, array $offerMap): void
    {
        $updated = 0;
        $missingOffers = 0;

        foreach ($this->requestSources() as $source) {
            if (! $this->legacyTableExists($source['table'])) {
                continue;
            }

            $query = MigrateHelper::legacy($source['table'])
                ->whereNotNull('offer_id')
                ->where('offer_id', '>', 0);

            foreach ($query->orderBy('id')->cursor() as $row) {
                $requestId = $requestMap[$this->legacyKey($source['table'], $row->id)] ?? null;
                $offerId = $offerMap[$this->legacyKey($source['offer_table'], $row->offer_id)] ?? null;

                if ($requestId === null || $offerId === null) {
                    $missingOffers++;

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("service_requests {$requestId} offer_id => {$offerId}");
                } else {
                    DB::table('service_requests')
                        ->where('id', $requestId)
                        ->update(['offer_id' => $offerId]);
                }

                $updated++;
            }
        }

        $this->console->info("Accepted service offers linked: {$updated}.");
        $this->console->warn("Accepted service offers not linked because the offer was missing: {$missingOffers}.");
    }

    /**
     * @param  array<string, int>  $requestMap
     */
    private function migrateServiceResults(bool $dryRun, array $requestMap, Collection $users): void
    {
        $migrated = 0;
        $existing = 0;
        $missingRequests = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        foreach ($this->resultSources() as $source) {
            if (! $this->legacyTableExists($source['table'])) {
                $this->console->warn("Legacy table was not found: {$source['table']}.");

                continue;
            }

            $query = MigrateHelper::legacy($source['table']);
            $bar = $this->console->getOutput()->createProgressBar($query->count());

            $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
                $dryRun,
                $source,
                $requestMap,
                $users,
                &$migrated,
                &$existing,
                &$missingRequests,
                &$missingUsers,
                &$invalidRows,
                $bar
            ): void {
                foreach ($rows as $row) {
                    $requestId = $requestMap[$this->legacyKey($source['request_table'], $row->{$source['request_fk']})] ?? null;

                    if ($requestId === null) {
                        $missingRequests++;
                        $bar->advance();

                        continue;
                    }

                    if (! $users->has($row->vendor_id)) {
                        $missingUsers++;
                        $bar->advance();

                        continue;
                    }

                    $status = $this->serviceResultStatus($row->status ?? null);

                    if ($status === null) {
                        $invalidRows++;
                        $bar->advance();

                        continue;
                    }

                    if (DB::table('service_results')->where('request_id', $requestId)->exists()) {
                        $existing++;
                    } elseif ($dryRun) {
                        $this->console->line("{$source['table']} {$row->id} => service_results");
                    } else {
                        DB::table('service_results')->insert([
                            'request_id' => $requestId,
                            'vendor_id' => $row->vendor_id,
                            'result' => (string) ($row->result ?? ''),
                            'advice' => blank($row->advice ?? null) ? null : (string) $row->advice,
                            'status' => $status,
                            'created_at' => $this->legacyDate($row->created_at ?? null) ?? now(),
                        ]);
                    }

                    $migrated++;
                    $bar->advance();
                }
            });

            $bar->finish();
            $this->console->newLine();
        }

        $this->console->info("Service results migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Service results skipped because the request was missing: {$missingRequests}.");
        $this->console->warn("Service results skipped because the vendor was missing: {$missingUsers}.");
        $this->console->warn("Service results skipped because their data was invalid: {$invalidRows}.");
    }

    /**
     * @param  array<string, int>  $requestMap
     */
    private function migrateServiceChats(
        bool $dryRun,
        array $requestMap,
        Collection $users,
        Collection $attachmentIds,
        Collection $attachmentsByStorageKey
    ): void {
        $migrated = 0;
        $existing = 0;
        $missingRequests = 0;
        $missingUsers = 0;
        $missingFiles = 0;
        $invalidRows = 0;

        foreach ($this->chatSources() as $source) {
            if (! $this->legacyTableExists($source['table'])) {
                $this->console->warn("Legacy table was not found: {$source['table']}.");

                continue;
            }

            $query = MigrateHelper::legacy($source['table']);
            $bar = $this->console->getOutput()->createProgressBar($query->count());

            $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
                $dryRun,
                $source,
                $requestMap,
                $users,
                $attachmentIds,
                $attachmentsByStorageKey,
                &$migrated,
                &$existing,
                &$missingRequests,
                &$missingUsers,
                &$missingFiles,
                &$invalidRows,
                $bar
            ): void {
                foreach ($rows as $row) {
                    $requestId = $requestMap[$this->legacyKey($source['request_table'], $row->{$source['request_fk']})] ?? null;

                    if ($requestId === null) {
                        $missingRequests++;
                        $bar->advance();

                        continue;
                    }

                    if (! $users->has($row->sender_id)) {
                        $missingUsers++;
                        $bar->advance();

                        continue;
                    }

                    if (! isset($row->msg)) {
                        $invalidRows++;
                        $bar->advance();

                        continue;
                    }

                    $createdAt = $this->legacyDate($row->created_at ?? null) ?? now();
                    $conversationId = $this->conversationId('service', $requestId, $createdAt, $dryRun);
                    $messageId = $this->messageId(
                        $conversationId,
                        $row->sender_id,
                        (bool) $row->is_vendor ? 1 : 0,
                        (string) $row->msg,
                        null,
                        $createdAt,
                        $dryRun
                    );

                    if ($messageId['existing']) {
                        $existing++;
                    }

                    $missingFiles += $this->migrateMessageAttachments(
                        $dryRun,
                        $messageId['id'],
                        $row->file ?? null,
                        $attachmentIds,
                        $attachmentsByStorageKey
                    );
                    $migrated++;
                    $bar->advance();
                }
            });

            $bar->finish();
            $this->console->newLine();
        }

        $this->console->info("Service chat messages migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Service chat messages skipped because the request was missing: {$missingRequests}.");
        $this->console->warn("Service chat messages skipped because the sender was missing: {$missingUsers}.");
        $this->console->warn("Service chat message files not found in attachments: {$missingFiles}.");
        $this->console->warn("Service chat messages skipped because their data was invalid: {$invalidRows}.");
    }

    private function migrateSubscriptionChats(
        bool $dryRun,
        Collection $users,
        Collection $attachmentIds,
        Collection $attachmentsByStorageKey
    ): void {
        if (! $this->legacyTableExists('ad_dad_lawyer_chat')) {
            $this->console->warn('Legacy table was not found: ad_dad_lawyer_chat.');

            return;
        }

        $subscriptionMap = $this->consultationSubscriptionMap();
        $query = MigrateHelper::legacy('ad_dad_lawyer_chat');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingSubscriptions = 0;
        $missingUsers = 0;
        $missingFiles = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $users,
            $attachmentIds,
            $attachmentsByStorageKey,
            $subscriptionMap,
            &$migrated,
            &$existing,
            &$missingSubscriptions,
            &$missingUsers,
            &$missingFiles,
            &$invalidRows,
            $bar
        ): void {
            foreach ($rows as $row) {
                $subscriptionId = $subscriptionMap[(int) ($row->sub_id ?? 0)] ?? null;

                if ($subscriptionId === null) {
                    $missingSubscriptions++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->sender_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                if (! isset($row->msg)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $type = (bool) ($row->is_service ?? false)
                    ? 2
                    : ((bool) ($row->is_lawyer ?? false) ? 1 : 0);
                $createdAt = $this->legacyDate($row->created_at ?? null) ?? now();
                $conversationId = $this->conversationId('subscription', $subscriptionId, $createdAt, $dryRun);
                $messageId = $this->messageId(
                    $conversationId,
                    $row->sender_id,
                    $type,
                    (string) $row->msg,
                    (int) ($row->dadcoin ?? 0),
                    $createdAt,
                    $dryRun
                );

                if ($messageId['existing']) {
                    $existing++;
                }

                $missingFiles += $this->migrateMessageAttachments(
                    $dryRun,
                    $messageId['id'],
                    $row->file ?? null,
                    $attachmentIds,
                    $attachmentsByStorageKey
                );
                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Subscription chat messages migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Subscription chat messages skipped because the subscription was missing: {$missingSubscriptions}.");
        $this->console->warn("Subscription chat messages skipped because the sender was missing: {$missingUsers}.");
        $this->console->warn("Subscription chat message files not found in attachments: {$missingFiles}.");
        $this->console->warn("Subscription chat messages skipped because their data was invalid: {$invalidRows}.");
    }

    private function migrateServiceAttachments(
        bool $dryRun,
        int $requestId,
        mixed $files,
        Collection $attachmentIds,
        Collection $attachmentsByStorageKey
    ): int {
        $missingFiles = 0;
        $sortOrder = 0;

        foreach ($this->attachmentTokens($files) as $file) {
            $attachmentId = $this->attachmentId($file, $attachmentIds, $attachmentsByStorageKey);

            if ($attachmentId === null) {
                $missingFiles++;

                continue;
            }

            if ($dryRun) {
                $sortOrder++;

                continue;
            }

            DB::table('service_attachments')->updateOrInsert(
                [
                    'request_id' => $requestId,
                    'attachment_id' => $attachmentId,
                ],
                [
                    'sort_order' => $sortOrder,
                    'created_at' => now(),
                ]
            );
            $sortOrder++;
        }

        return $missingFiles;
    }

    private function migrateMessageAttachments(
        bool $dryRun,
        int $messageId,
        mixed $files,
        Collection $attachmentIds,
        Collection $attachmentsByStorageKey
    ): int {
        $missingFiles = 0;
        $sortOrder = 0;

        foreach ($this->attachmentTokens($files) as $file) {
            $attachmentId = $this->attachmentId($file, $attachmentIds, $attachmentsByStorageKey);

            if ($attachmentId === null) {
                $missingFiles++;

                continue;
            }

            if ($dryRun) {
                $sortOrder++;

                continue;
            }

            DB::table('message_attachments')->updateOrInsert(
                [
                    'message_id' => $messageId,
                    'attachment_id' => $attachmentId,
                ],
                [
                    'sort_order' => $sortOrder,
                    'created_at' => now(),
                ]
            );
            $sortOrder++;
        }

        return $missingFiles;
    }

    private function conversationId(string $subjectType, int $subjectId, CarbonImmutable $createdAt, bool $dryRun): int
    {
        $conversationId = DB::table('conversations')
            ->where('subject_type', $subjectType)
            ->where('subject_id', $subjectId)
            ->value('id');

        if ($conversationId !== null) {
            return (int) $conversationId;
        }

        if ($dryRun) {
            return $this->nextDryRunId();
        }

        return (int) DB::table('conversations')->insertGetId([
            'uuid' => $this->deterministicUuid("conversation:{$subjectType}:{$subjectId}"),
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }

    /**
     * @return array{id:int,existing:bool}
     */
    private function messageId(
        int $conversationId,
        int $senderId,
        int $type,
        string $body,
        ?int $dadcoin,
        CarbonImmutable $createdAt,
        bool $dryRun
    ): array {
        $query = DB::table('messages')
            ->where('conversation_id', $conversationId)
            ->where('sender_id', $senderId)
            ->where('type', $type)
            ->where('body', $body)
            ->where('dadcoin', $dadcoin)
            ->where('created_at', $createdAt);

        $messageId = $query->value('id');

        if ($messageId !== null) {
            $this->touchConversation($conversationId, $createdAt, $dryRun);

            return ['id' => (int) $messageId, 'existing' => true];
        }

        if ($dryRun) {
            return ['id' => $this->nextDryRunId(), 'existing' => false];
        }

        $messageId = (int) DB::table('messages')->insertGetId([
            'conversation_id' => $conversationId,
            'sender_id' => $senderId,
            'type' => $type,
            'body' => $body,
            'dadcoin' => $dadcoin,
            'created_at' => $createdAt,
        ]);

        $this->touchConversation($conversationId, $createdAt, $dryRun);

        return ['id' => $messageId, 'existing' => false];
    }

    private function touchConversation(int $conversationId, CarbonImmutable $messageAt, bool $dryRun): void
    {
        if ($dryRun) {
            return;
        }

        DB::table('conversations')
            ->where('id', $conversationId)
            ->where(fn ($query) => $query
                ->whereNull('updated_at')
                ->orWhere('updated_at', '<', $messageAt))
            ->update(['updated_at' => $messageAt]);
    }

    /**
     * @return array<int, int>
     */
    private function consultationSubscriptionMap(): array
    {
        if (! $this->legacyTableExists('ad_dad_lawyer_subscription')) {
            return [];
        }

        $map = [];

        foreach (MigrateHelper::legacy('ad_dad_lawyer_subscription')->orderBy('id')->cursor() as $row) {
            $subscriptionId = DB::table('consultation_subscriptions')
                ->where('id', $row->id)
                ->value('id');

            if ($subscriptionId === null) {
                $subscriptionId = DB::table('consultation_subscriptions')
                    ->where('client_id', $row->user_id)
                    ->where('vendor_id', $row->vendor_id)
                    ->value('id');
            }

            if ($subscriptionId !== null) {
                $map[(int) $row->id] = (int) $subscriptionId;
            }
        }

        return $map;
    }

    private function attachmentId(mixed $file, Collection $attachmentIds, Collection $attachmentsByStorageKey): ?int
    {
        if (blank($file)) {
            return null;
        }

        if (ctype_digit((string) $file)) {
            $fileId = (int) $file;

            return $attachmentIds->has($fileId) ? $fileId : null;
        }

        foreach ($this->fileStorageKeyCandidates((string) $file) as $storageKey) {
            $attachmentId = $attachmentsByStorageKey->get($storageKey);

            if ($attachmentId !== null) {
                return (int) $attachmentId;
            }
        }

        return null;
    }

    /**
     * @return list<string>
     */
    private function attachmentTokens(mixed $files): array
    {
        if (blank($files)) {
            return [];
        }

        return array_values(array_filter(
            array_map('trim', explode(',', (string) $files)),
            fn (string $file): bool => $file !== ''
        ));
    }

    /**
     * @return list<string>
     */
    private function fileStorageKeyCandidates(string $file): array
    {
        $path = parse_url($file, PHP_URL_PATH) ?: $file;
        $path = ltrim(rawurldecode($path), '/');
        $candidates = [$path];

        $legacyPrefix = 'wp-content/uploads/dadline/';
        if (str_starts_with($path, $legacyPrefix)) {
            $candidates[] = 'private/'.substr($path, strlen($legacyPrefix));
        }

        return array_values(array_unique(array_filter($candidates)));
    }

    /**
     * @return list<array<string, string>>
     */
    private function requestSources(): array
    {
        return [
            [
                'table' => 'ad_dad_case',
                'offer_table' => 'ad_dad_case_offer',
                'type' => 'case',
                'user' => 'user_id',
                'title' => 'case_title',
                'description' => 'case_description',
                'category' => 'case_category',
                'files' => 'file_urls',
            ],
            [
                'table' => 'ad_dad_lawlink',
                'offer_table' => 'ad_dad_lawlink_offer',
                'type' => 'lawlink',
                'user' => 'user_id',
                'title' => 'title',
                'description' => 'description',
                'category' => 'category',
                'files' => 'file_urls',
            ],
            [
                'table' => 'ad_dad_legal_doc',
                'offer_table' => 'ad_dad_doc_offer',
                'type' => 'document',
                'user' => 'user_id',
                'title' => 'doc_title',
                'description' => 'doc_description',
                'category' => 'doc_category',
                'files' => 'file_urls',
            ],
        ];
    }

    /**
     * @return list<array<string, string>>
     */
    private function offerSources(): array
    {
        return [
            ['table' => 'ad_dad_case_offer', 'request_table' => 'ad_dad_case', 'request_fk' => 'case_id'],
            ['table' => 'ad_dad_lawlink_offer', 'request_table' => 'ad_dad_lawlink', 'request_fk' => 'lawlink_id'],
            ['table' => 'ad_dad_doc_offer', 'request_table' => 'ad_dad_legal_doc', 'request_fk' => 'doc_id'],
        ];
    }

    /**
     * @return list<array<string, string>>
     */
    private function resultSources(): array
    {
        return [
            ['table' => 'ad_dad_case_results', 'request_table' => 'ad_dad_case', 'request_fk' => 'case_id'],
            ['table' => 'ad_dad_doc_results', 'request_table' => 'ad_dad_legal_doc', 'request_fk' => 'doc_id'],
        ];
    }

    /**
     * @return list<array<string, string>>
     */
    private function chatSources(): array
    {
        return [
            ['table' => 'ad_dad_case_chat', 'request_table' => 'ad_dad_case', 'request_fk' => 'case_id'],
            ['table' => 'ad_dad_lawlink_chat', 'request_table' => 'ad_dad_lawlink', 'request_fk' => 'lawlink_id'],
            ['table' => 'ad_dad_doc_chat', 'request_table' => 'ad_dad_legal_doc', 'request_fk' => 'doc_id'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function requestDetails(string $type, object $row): array
    {
        $details = match ($type) {
            'case' => [
                'local_check' => (bool) ($row->local_check ?? false),
                'show_bio' => (bool) ($row->show_bio ?? false),
                'show_vip' => (bool) ($row->show_vip ?? false),
            ],
            'lawlink' => [
                'city_id' => $row->city_id ?? null,
                'budget' => $row->budget ?? null,
                'period' => $row->period ?? null,
                'ticket_id' => $row->ticket_id ?? null,
            ],
            'document' => [
                'doc_type' => $row->doc_type ?? null,
            ],
            default => [],
        };

        return array_filter($details, fn (mixed $value): bool => $value !== null && $value !== '');
    }

    private function requestVendorType(string $type, object $row): string
    {
        $vendorType = match ($type) {
            'case' => $row->case_type ?? null,
            'lawlink' => $row->type ?? null,
            default => null,
        };

        return in_array($vendorType, ['judge', 'expert', 'lawyer'], true)
            ? $vendorType
            : 'all';
    }

    private function serviceRequestStatus(?string $status): ?string
    {
        return match (strtolower(trim($status ?? ''))) {
            'draft', '' => 'draft',
            'submited', 'submitted' => 'submitted',
            'offer' => 'offer',
            'return', 'returned' => 'returned',
            'handling' => 'handling',
            'finished' => 'finished',
            default => null,
        };
    }

    private function serviceOfferStatus(?string $status): ?string
    {
        return match (strtolower(trim($status ?? ''))) {
            'pending', '' => 'pending',
            'accepted' => 'accepted',
            'rejected' => 'rejected',
            default => null,
        };
    }

    private function serviceResultStatus(?string $status): ?string
    {
        return match (strtolower(trim($status ?? ''))) {
            'draft', '' => 'draft',
            'publish' => 'publish',
            default => null,
        };
    }

    private function walletTransactionId(mixed $value): ?int
    {
        if ($value === null || $value === '' || ! ctype_digit((string) $value)) {
            return null;
        }

        $transactionId = (int) $value;

        return DB::table('wallet_transactions')->where('id', $transactionId)->exists()
            ? $transactionId
            : null;
    }

    private function legacyTableExists(string $table): bool
    {
        return Schema::connection('legacy')->hasTable($table);
    }

    private function legacyKey(string $table, mixed $id): string
    {
        return "{$table}:{$id}";
    }

    private function deterministicUuid(string $key): string
    {
        $hex = substr(sha1("dadline-service-marketplace:{$key}"), 0, 32);
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

    private function encodeJson(?array $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }

    private function nextDryRunId(): int
    {
        return --$this->dryRunId;
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
