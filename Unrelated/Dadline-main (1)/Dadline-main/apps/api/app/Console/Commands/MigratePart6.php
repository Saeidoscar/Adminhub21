<?php

namespace App\Console\Commands;

use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

class MigratePart6
{
    private const CHUNK_SIZE = 500;

    public function __construct(
        private Command $console
    ) {}

    public function migrateContracts(bool $dryRun): void
    {
        $this->console->info('Migrating Contracts...');

        if (! Schema::connection('legacy')->hasTable('ad_dad_contract')) {
            $this->console->warn('Legacy table ad_dad_contract was not found.');

            return;
        }

        $query = MigrateHelper::legacy('ad_dad_contract');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingCreators = 0;
        $duplicateTrackingCodes = 0;
        $ignoredQrPics = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingCreators,
            &$duplicateTrackingCodes,
            &$ignoredQrPics
        ): void {
            $trackingCodes = $rows
                ->pluck('unique_code')
                ->map(fn (mixed $value): ?string => $this->normalizeTrackingCode($value))
                ->filter()
                ->unique();
            $existingIds = DB::table('contracts')
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $existingTrackingCodes = DB::table('contracts')
                ->whereIn('tracking_code', $trackingCodes)
                ->pluck('tracking_code')
                ->flip();
            $qrAttachmentIds = $rows
                ->pluck('qr_pic')
                ->map(fn (mixed $value): ?int => $this->numericId($value))
                ->filter()
                ->unique();
            $qrAttachments = DB::table('attachments')
                ->whereIn('id', $qrAttachmentIds)
                ->pluck('id')
                ->flip();
            $creatorIds = $this->creatorIdsForContracts($rows->pluck('id')->unique());
            $seenTrackingCodes = collect();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                $creatorId = $creatorIds->get($row->id);

                if ($creatorId === null) {
                    $missingCreators++;
                }

                $createdAt = $this->legacyDate($row->created_at ?? null) ?? now();
                $updatedAt = $this->legacyDate($row->updated_at ?? null) ?? $createdAt;
                $trackingCode = $this->normalizeTrackingCode($row->unique_code ?? null);

                if ($trackingCode !== null && ($existingTrackingCodes->has($trackingCode) || $seenTrackingCodes->has($trackingCode))) {
                    $trackingCode = null;
                    $duplicateTrackingCodes++;
                }

                if ($trackingCode !== null) {
                    $seenTrackingCodes->put($trackingCode, true);
                }

                $qrId = $this->numericId($row->qr_pic ?? null);

                if ($qrId !== null && ! $qrAttachments->has($qrId)) {
                    $qrId = null;
                    $ignoredQrPics++;
                }

                if ($dryRun) {
                    $this->console->line("Contract {$row->id} => creator {$creatorId}");
                } else {
                    DB::table('contracts')->insert([
                        'id' => (int) $row->id,
                        'uuid' => (string) Str::uuid(),
                        'creator_id' => $creatorId,
                        'title' => Str::limit(trim((string) $row->title) ?: "Legacy contract {$row->id}", 255, ''),
                        'body' => (string) $row->contract_body,
                        'status' => $this->contractStatus($row->status ?? null),
                        'tracking_code' => $trackingCode,
                        'pin_code' => $this->normalizePinCode($row->pass ?? null),
                        'qr_id' => $qrId,
                        'created_at' => $createdAt,
                        'updated_at' => $updatedAt,
                        'deleted_at' => null,
                    ]);
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Contracts migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Contracts migrated with null creator_id because no migrated creator could be inferred: {$missingCreators}.");
        $this->console->warn("Contracts whose duplicate tracking_code was nulled: {$duplicateTrackingCodes}.");
        $this->console->warn("Contract qr_pic values ignored because they were not migrated attachment ids: {$ignoredQrPics}.");
    }

    public function migrateContractAttachments(bool $dryRun): void
    {
        $this->console->info('Migrating Contract Attachments...');

        if (! Schema::connection('legacy')->hasTable('ad_dad_contract')) {
            $this->console->warn('Legacy table ad_dad_contract was not found.');

            return;
        }

        if (! Schema::connection('legacy')->hasColumn('ad_dad_contract', 'file_urls')) {
            $this->console->warn('Legacy column ad_dad_contract.file_urls was not found.');

            return;
        }

        $query = MigrateHelper::legacy('ad_dad_contract')
            ->whereNotNull('file_urls')
            ->where('file_urls', '<>', '');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingContracts = 0;
        $missingAttachments = 0;
        $invalidAttachmentIds = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingContracts,
            &$missingAttachments,
            &$invalidAttachmentIds
        ): void {
            $contracts = $this->eligibleContractIds($rows->pluck('id')->unique(), $dryRun);
            $fileIdsByContract = $rows->mapWithKeys(
                fn ($row): array => [(int) $row->id => $this->attachmentIdsFromFileUrls($row->file_urls ?? null, $invalidAttachmentIds)]
            );
            $attachmentIds = $fileIdsByContract
                ->flatten()
                ->unique()
                ->values();
            $attachments = DB::table('attachments')
                ->whereIn('id', $attachmentIds)
                ->pluck('id')
                ->flip();
            $existingPairs = DB::table('contract_attachments')
                ->whereIn('contract_id', $rows->pluck('id'))
                ->get(['contract_id', 'attachment_id'])
                ->mapWithKeys(fn ($row): array => [$this->attachmentPairKey((int) $row->contract_id, (int) $row->attachment_id) => true]);

            foreach ($rows as $row) {
                $contractId = (int) $row->id;
                $fileIds = $fileIdsByContract->get($contractId, []);

                if ($fileIds === []) {
                    $bar->advance();

                    continue;
                }

                if (! $contracts->has($contractId)) {
                    $missingContracts++;
                    $bar->advance();

                    continue;
                }

                foreach ($fileIds as $index => $attachmentId) {
                    if (! $attachments->has($attachmentId)) {
                        $missingAttachments++;

                        continue;
                    }

                    $pairKey = $this->attachmentPairKey($contractId, $attachmentId);

                    if ($existingPairs->has($pairKey)) {
                        $existing++;

                        continue;
                    }

                    if ($dryRun) {
                        $this->console->line("Contract attachment {$contractId} => attachment {$attachmentId}");
                    } else {
                        DB::table('contract_attachments')->insert([
                            'contract_id' => $contractId,
                            'attachment_id' => $attachmentId,
                            'sort_order' => $index,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }

                    $existingPairs->put($pairKey, true);
                    $migrated++;
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Contract attachments migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Contract attachment rows skipped because their contract was missing: {$missingContracts}.");
        $this->console->warn("Contract file_urls attachment ids ignored because they were not migrated attachment ids: {$missingAttachments}.");
        $this->console->warn("Contract file_urls values ignored because they were not numeric attachment ids: {$invalidAttachmentIds}.");
    }

    public function migrateSignatures(bool $dryRun): void
    {
        $this->console->info('Migrating Signatures...');

        if (! Schema::connection('legacy')->hasTable('ad_dad_contract_signatories')) {
            $this->console->warn('Legacy table ad_dad_contract_signatories was not found.');

            return;
        }

        $query = MigrateHelper::legacy('ad_dad_contract_signatories');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingContracts = 0;
        $missingUsers = 0;
        $ignoredSignaturePics = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingContracts,
            &$missingUsers,
            &$ignoredSignaturePics
        ): void {
            $existingIds = DB::table('signatures')
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $contracts = $this->eligibleContractIds($rows->pluck('contract_id')->filter()->unique(), $dryRun);
            $users = DB::table('users')
                ->whereIn('id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('id')
                ->flip();
            $attachmentIds = $rows
                ->pluck('signature_pic')
                ->map(fn (mixed $value): ?int => $this->numericId($value))
                ->filter()
                ->unique();
            $attachments = DB::table('attachments')
                ->whereIn('id', $attachmentIds)
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $contracts->has($row->contract_id)) {
                    $missingContracts++;
                    $bar->advance();

                    continue;
                }

                $userId = $row->user_id === null ? null : (int) $row->user_id;

                if ($userId !== null && ! $users->has($userId)) {
                    $userId = null;
                    $missingUsers++;
                }

                $signatureAttachmentId = $this->numericId($row->signature_pic ?? null);

                if ($signatureAttachmentId !== null && ! $attachments->has($signatureAttachmentId)) {
                    $signatureAttachmentId = null;
                    $ignoredSignaturePics++;
                } elseif ($signatureAttachmentId === null && filled($row->signature_pic ?? null)) {
                    $ignoredSignaturePics++;
                }

                if ($dryRun) {
                    $this->console->line("Contract signature {$row->id} => contract {$row->contract_id}");
                } else {
                    $createdAt = $this->legacyDate($row->created_at ?? null) ?? now();
                    $updatedAt = $this->legacyDate($row->updated_at ?? null) ?? $createdAt;

                    DB::table('signatures')->insert([
                        'id' => (int) $row->id,
                        'contract_id' => (int) $row->contract_id,
                        'user_id' => $userId,
                        'full_name' => filled($row->name ?? null) ? Str::limit(trim((string) $row->name), 255, '') : null,
                        'mobile' => $this->normalizeMobile($row->mobile ?? null),
                        'verification_code' => $this->normalizeFixedDigitCode($row->verification_code ?? null, 6),
                        'code_expires_at' => null,
                        'signature_status' => $this->signatureStatus($row->signature_status ?? null),
                        'ip_address' => filled($row->ip_address ?? null) ? Str::limit(trim((string) $row->ip_address), 45, '') : null,
                        'user_agent' => $row->user_agent,
                        'metadata' => null,
                        'signature_id' => $signatureAttachmentId,
                        'signed_at' => $this->legacyDate($row->signed_at ?? null),
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
        $this->console->info("Signatures migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Signatures skipped because their contract was missing: {$missingContracts}.");
        $this->console->warn("Signatures whose missing user_id was nulled: {$missingUsers}.");
        $this->console->warn("Contract signature_pic values ignored because they were not migrated attachment ids: {$ignoredSignaturePics}.");
    }

    public function migrateContractAiAnalyses(bool $dryRun): void
    {
        $this->console->info('Migrating Contract AI Analyses...');

        if (! Schema::connection('legacy')->hasTable('ad_dad_contract_ai_data')) {
            $this->console->warn('Legacy table ad_dad_contract_ai_data was not found.');

            return;
        }

        $query = MigrateHelper::legacy('ad_dad_contract_ai_data');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingContracts = 0;
        $invalidJson = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingContracts,
            &$invalidJson
        ): void {
            $existingIds = DB::table('contract_ai_analyses')
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $existingContracts = DB::table('contract_ai_analyses')
                ->whereIn('contract_id', $rows->pluck('contract_id')->filter()->unique())
                ->pluck('contract_id')
                ->flip();
            $contracts = $this->eligibleContractIds($rows->pluck('contract_id')->filter()->unique(), $dryRun);
            $seenContracts = collect();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id) || $existingContracts->has($row->contract_id) || $seenContracts->has($row->contract_id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $contracts->has($row->contract_id)) {
                    $missingContracts++;
                    $bar->advance();

                    continue;
                }

                if (! $this->isValidJson($row->ai_data ?? null)) {
                    $invalidJson++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Contract AI analysis {$row->id} => contract {$row->contract_id}");
                } else {
                    $updatedAt = $this->legacyDate($row->updated_at ?? null) ?? now();

                    DB::table('contract_ai_analyses')->insert([
                        'id' => (int) $row->id,
                        'contract_id' => (int) $row->contract_id,
                        'ai_data' => (string) $row->ai_data,
                        'ai_content' => $row->ai_content,
                        'created_at' => $updatedAt,
                        'updated_at' => $updatedAt,
                    ]);
                }

                $seenContracts->put($row->contract_id, true);
                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Contract AI analyses migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Contract AI analyses skipped because their contract was missing: {$missingContracts}.");
        $this->console->warn("Contract AI analyses skipped because ai_data was invalid JSON: {$invalidJson}.");
    }

    private function creatorIdsForContracts(Collection $contractIds): Collection
    {
        if ($contractIds->isEmpty()) {
            return collect();
        }

        $rows = MigrateHelper::legacy('ad_dad_contract_signatories')
            ->whereIn('contract_id', $contractIds)
            ->whereNotNull('user_id')
            ->orderByDesc('is_primary')
            ->orderBy('id')
            ->get(['contract_id', 'user_id']);
        $users = DB::table('users')
            ->whereIn('id', $rows->pluck('user_id')->filter()->unique())
            ->pluck('id')
            ->flip();
        $creatorIds = collect();

        foreach ($rows as $row) {
            if ($creatorIds->has($row->contract_id) || ! $users->has((int) $row->user_id)) {
                continue;
            }

            $creatorIds->put($row->contract_id, (int) $row->user_id);
        }

        return $creatorIds;
    }

    private function eligibleContractIds(Collection $contractIds, bool $dryRun): Collection
    {
        if ($contractIds->isEmpty()) {
            return collect();
        }

        if ($dryRun) {
            return MigrateHelper::legacy('ad_dad_contract')
                ->whereIn('id', $contractIds)
                ->pluck('id')
                ->flip();
        }

        return DB::table('contracts')
            ->whereIn('id', $contractIds)
            ->pluck('id')
            ->flip();
    }

    private function contractStatus(?string $status): string
    {
        return match ($status) {
            'active', 'completed', 'expired', 'cancelled' => $status,
            default => 'draft',
        };
    }

    private function signatureStatus(?string $status): string
    {
        return $status === 'signed' ? 'signed' : 'pending';
    }

    private function normalizeTrackingCode(mixed $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        return Str::limit(trim((string) $value), 30, '');
    }

    private function normalizePinCode(mixed $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $value);

        if ($digits === null || $digits === '' || strlen($digits) > 4) {
            return null;
        }

        return str_pad($digits, 4, '0', STR_PAD_LEFT);
    }

    private function normalizeMobile(mixed $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $value);

        if ($digits === null) {
            return null;
        }

        if (strlen($digits) === 12 && str_starts_with($digits, '98')) {
            $digits = '0'.substr($digits, 2);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '9')) {
            $digits = '0'.$digits;
        }

        return preg_match('/^09[0-9]{9}$/', $digits) === 1 ? $digits : null;
    }

    private function normalizeFixedDigitCode(mixed $value, int $length): ?string
    {
        if (blank($value)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $value);

        return $digits !== null && strlen($digits) === $length ? $digits : null;
    }

    private function numericId(mixed $value): ?int
    {
        if (blank($value) || ! is_numeric($value)) {
            return null;
        }

        $id = (int) $value;

        return $id > 0 ? $id : null;
    }

    /**
     * @return list<int>
     */
    private function attachmentIdsFromFileUrls(mixed $value, int &$invalidAttachmentIds): array
    {
        if (blank($value)) {
            return [];
        }

        if (is_array($value)) {
            $parts = $value;
        } else {
            $parts = preg_split('/\s*,\s*/', trim((string) $value)) ?: [];
        }

        $ids = [];

        foreach ($parts as $part) {
            $id = $this->numericId($part);

            if ($id === null) {
                if (filled($part)) {
                    $invalidAttachmentIds++;
                }

                continue;
            }

            $ids[$id] = $id;
        }

        return array_values($ids);
    }

    private function attachmentPairKey(int $contractId, int $attachmentId): string
    {
        return "{$contractId}:{$attachmentId}";
    }

    private function isValidJson(mixed $value): bool
    {
        if (! is_string($value) || trim($value) === '') {
            return false;
        }

        json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE;
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
