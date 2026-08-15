<?php

namespace App\Console\Commands;

use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

class MigratePart7
{
    private const CHUNK_SIZE = 500;

    /**
     * @var array<int, int|null>
     */
    private array $singleCaseIdByOffice = [];

    /**
     * @var array<string, int|null>
     */
    private array $caseIdByLegacyCode = [];

    public function __construct(
        private Command $console
    ) {}

    public function migrateOfficeCore(bool $dryRun): void
    {
        $this->migrateOfficeClaimTypes($dryRun);
        $this->migrateOfficeRequestTypes($dryRun);
        $this->migrateOfficeReferralAuthorities($dryRun);
        $this->migrateOffices($dryRun);
        $this->migrateOfficeMembers($dryRun);
        $this->migrateOfficeContacts($dryRun);
        $this->migrateOfficeCases($dryRun);
        $this->syncOfficeCaseBaseFields($dryRun);
        $this->mergeOfficeCaseMeta($dryRun);
        $this->migrateOfficeCaseParties($dryRun);
    }

    public function migrateOfficeWorkflow(bool $dryRun): void
    {
        $this->migrateOfficeCaseNotes($dryRun);
        $this->migrateOfficeCaseActions($dryRun);
        $this->migrateOfficeTimeLogs($dryRun);
        $this->migrateOfficeCaseTasks($dryRun);
        $this->migrateOfficeCaseEvents($dryRun);
        $this->migrateOfficeAiCaseAnalyses($dryRun);
    }

    public function migrateOfficeFinancialAndAttachments(bool $dryRun): void
    {
        $this->migrateOfficeTransactions($dryRun);
        $this->migrateOfficeAttachments($dryRun);
    }

    private function migrateOfficeClaimTypes(bool $dryRun): void
    {
        $this->migrateSimpleLegacyTable(
            $dryRun,
            ['ad_dad_office_claim_types', 'ad_dad_office_claim_type'],
            'office_claim_types',
            fn (object $row): ?array => [
                'id' => $this->id($row),
                'parent_id' => $this->nullableId($this->value($row, ['parent_id', 'parent'])),
                'category' => $this->claimCategory($this->value($row, ['category', 'type'], 'حقوقی')),
                'name' => Str::limit($this->string($this->value($row, ['name', 'title', 'label']), "Legacy claim type {$this->id($row)}"), 255, ''),
                'is_leaf' => (bool) $this->value($row, ['is_leaf', 'leaf'], false),
            ]
        );
    }

    private function migrateOfficeRequestTypes(bool $dryRun): void
    {
        $legacyTable = $this->firstExistingTable([
            'ad_dad_office_request_types',
            'ad_dad_office_request_type',
            'ad_dad_office_case_request_types',
        ]);

        if ($legacyTable === null) {
            $this->migrateOfficeRequestTypesFromOptions($dryRun);

            return;
        }

        $this->console->info("Migrating {$legacyTable} to office_request_types...");

        $query = MigrateHelper::legacy($legacyTable);
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$invalidRows
        ): void {
            foreach ($rows as $row) {
                $id = $this->id($row);
                $name = $this->nullableString($this->value($row, ['name', 'title', 'label']));
                $code = $this->requestTypeCode($this->value($row, ['code', 'slug', 'key', 'name', 'title', 'label'], $id));

                if ($name === null || $code === null) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("office_request_types {$id} => {$code}");
                } else {
                    DB::table('office_request_types')->updateOrInsert(
                        ['id' => $id],
                        [
                            'code' => $code,
                            'name' => Str::limit($name, 100, ''),
                            'sort_order' => (int) $this->value($row, ['sort_order', 'order', 'position'], $id * 10),
                            'is_active' => (bool) $this->value($row, ['is_active', 'active'], true),
                        ]
                    );
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("office_request_types migrated or updated: {$migrated}.");
        $this->console->warn("office_request_types skipped because their data was invalid: {$invalidRows}.");
    }

    private function migrateOfficeRequestTypesFromOptions(bool $dryRun): void
    {
        $this->console->info('Migrating legal.claim_types option to office_request_types...');

        $rows = $this->legalOptionRows('claim_types', [
            ['id' => 1, 'name' => 'دادخواست بدوی/شکوائیه'],
            ['id' => 2, 'name' => 'حقوقی'],
            ['id' => 3, 'name' => 'کیفری'],
            ['id' => 4, 'name' => 'اعاده دادرسی کیفری'],
            ['id' => 5, 'name' => 'اعاده دادرسی مدنی'],
            ['id' => 6, 'name' => 'تجدیدنظر خواهی'],
            ['id' => 7, 'name' => 'اعتراض به قرار'],
            ['id' => 8, 'name' => 'اعتراض ثالث'],
            ['id' => 11, 'name' => 'تقابل'],
            ['id' => 12, 'name' => 'جلب ثالث'],
            ['id' => 13, 'name' => 'ورود ثالث'],
            ['id' => 14, 'name' => 'واخواهی'],
            ['id' => 20, 'name' => 'سایر'],
        ]);

        $this->upsertReferenceRows($dryRun, 'office_request_types', $rows, fn (array $row): array => [
            'id' => (int) $row['id'],
            'code' => $this->requestTypeCode($row['id']) ?? $this->legacyCodeSlug($row['name']),
            'name' => Str::limit((string) $row['name'], 100, ''),
            'sort_order' => (int) $row['id'] * 10,
            'is_active' => true,
        ]);
    }

    private function migrateOfficeReferralAuthorities(bool $dryRun): void
    {
        if (! Schema::hasTable('office_referral_authorities')) {
            $this->console->warn('Destination table office_referral_authorities was not found. Run Laravel migrations first.');

            return;
        }

        $this->console->info('Migrating legal.referral_authorities option to office_referral_authorities...');

        $rows = $this->legalOptionRows('referral_authorities', [
            ['id' => 1, 'name' => 'شورای حل اختلاف'],
            ['id' => 2, 'name' => 'محاکم حقوقی'],
            ['id' => 3, 'name' => 'محاکم کیفری یک'],
            ['id' => 4, 'name' => 'محاکم کیفری دو'],
            ['id' => 5, 'name' => 'محاکم خانواده'],
            ['id' => 6, 'name' => 'اجرای احکام مدنی/کیفری'],
            ['id' => 7, 'name' => 'دادگاه های صلح'],
            ['id' => 8, 'name' => 'دادسرا'],
            ['id' => 9, 'name' => 'محاکم تجدیدنظر'],
            ['id' => 10, 'name' => 'دیوان عالی کشور'],
            ['id' => 11, 'name' => 'دیوان عدالت اداری'],
            ['id' => 12, 'name' => 'دادسرا و دادگاه نظامی'],
            ['id' => 13, 'name' => 'دادگاه انقلاب'],
            ['id' => 14, 'name' => 'دادگاه روحانیت'],
            ['id' => 20, 'name' => 'سایر مراجع'],
        ]);

        $this->upsertReferenceRows($dryRun, 'office_referral_authorities', $rows, fn (array $row): array => [
            'id' => (int) $row['id'],
            'name' => Str::limit((string) $row['name'], 100, ''),
            'sort_order' => (int) $row['id'] * 10,
            'is_active' => true,
        ]);
    }

    private function migrateOffices(bool $dryRun): void
    {
        $legacyTable = $this->firstExistingTable(['ad_dad_offices', 'ad_dad_office_offices', 'ad_dad_office']);

        if ($legacyTable === null) {
            $this->migrateSyntheticOffices($dryRun);

            return;
        }

        $this->migrateSimpleLegacyTable(
            $dryRun,
            [$legacyTable],
            'offices',
            function (object $row): ?array {
                $ownerId = $this->nullableId($this->value($row, ['owner_id', 'user_id', 'lawyer_id', 'vendor_id']));

                if ($ownerId === null || ! $this->destinationExists('users', $ownerId)) {
                    return null;
                }

                $createdAt = $this->legacyDate($this->value($row, ['created_at'])) ?? now();

                return [
                    'id' => $this->id($row),
                    'owner_id' => $ownerId,
                    'name' => $this->officeName($ownerId),
                    'status' => $this->officeStatus($this->value($row, ['status'], 'active')),
                    'holiday' => $this->json($this->value($row, ['holiday', 'holidays'])),
                    'created_at' => $createdAt,
                    'updated_at' => $this->legacyDate($this->value($row, ['updated_at'])) ?? $createdAt,
                    'deleted_at' => $this->legacyDate($this->value($row, ['deleted_at'])),
                ];
            }
        );
    }

    private function migrateOfficeMembers(bool $dryRun): void
    {
        if ($this->firstExistingTable(['ad_dad_office_members', 'ad_dad_office_member']) === null) {
            $this->migrateSyntheticOfficeMembers($dryRun);

            return;
        }

        $this->migrateSimpleLegacyTable(
            $dryRun,
            ['ad_dad_office_members', 'ad_dad_office_member'],
            'office_members',
            function (object $row): ?array {
                $officeId = $this->officeIdFromRow($row);
                $userId = $this->nullableId($this->value($row, ['user_id', 'member_id']));

                if ($officeId === null || $userId === null || ! $this->destinationExists('offices', $officeId) || ! $this->destinationExists('users', $userId)) {
                    return null;
                }

                return [
                    'id' => $this->id($row),
                    'office_id' => $officeId,
                    'user_id' => $userId,
                    'role' => $this->memberRole($this->value($row, ['role'])),
                    'can_access' => (bool) $this->value($row, ['can_access', 'active', 'status'], true),
                    'permissions' => $this->json($this->value($row, ['permissions', 'permission'])),
                    'created_at' => $this->legacyDate($this->value($row, ['created_at'])) ?? now(),
                ];
            }
        );
    }

    private function migrateSyntheticOffices(bool $dryRun): void
    {
        $this->console->info('No standalone legacy office table found; synthesizing offices from ad_dad_office_* rows...');

        $officeRows = $this->syntheticOfficeRows();
        $bar = $this->console->getOutput()->createProgressBar($officeRows->count());
        $migrated = 0;
        $existing = 0;
        $invalidRows = 0;

        foreach ($officeRows as $officeId => $row) {
            if (DB::table('offices')->where('id', $officeId)->exists()) {
                $existing++;
                $bar->advance();

                continue;
            }

            $ownerId = $this->firstExistingUserId($row['owner_candidates']);

            if ($ownerId === null) {
                $invalidRows++;
                $bar->advance();

                continue;
            }

            $createdAt = $row['created_at'] ?? now();

            if ($dryRun) {
                $this->console->line("Synthetic office {$officeId} => owner {$ownerId}");
            } else {
                DB::table('offices')->insert([
                    'id' => $officeId,
                    'owner_id' => $ownerId,
                    'name' => $this->officeName($ownerId),
                    'status' => 'active',
                    'holiday' => null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                    'deleted_at' => null,
                ]);
            }

            $migrated++;
            $bar->advance();
        }

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Synthetic offices migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Synthetic offices skipped because no valid owner user could be inferred: {$invalidRows}.");
    }

    private function migrateSyntheticOfficeMembers(bool $dryRun): void
    {
        $this->console->info('No legacy office member table found; synthesizing owner office_members from offices...');

        $query = DB::table('offices')->orderBy('id');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;

        $query->chunkById(self::CHUNK_SIZE, function (Collection $offices) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing
        ): void {
            foreach ($offices as $office) {
                $exists = DB::table('office_members')
                    ->where('office_id', $office->id)
                    ->where('user_id', $office->owner_id)
                    ->exists();

                if ($exists) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Synthetic office member office {$office->id} => owner {$office->owner_id}");
                } else {
                    DB::table('office_members')->insert([
                        'office_id' => $office->id,
                        'user_id' => $office->owner_id,
                        'role' => 'owner',
                        'can_access' => true,
                        'permissions' => null,
                        'created_at' => $office->created_at ?? now(),
                    ]);
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Synthetic office members migrated: {$migrated}; already existed: {$existing}.");
    }

    private function migrateOfficeContacts(bool $dryRun): void
    {
        $this->migrateSimpleLegacyTable(
            $dryRun,
            ['ad_dad_office_contacts', 'ad_dad_office_clients', 'ad_dad_office_contact'],
            'office_contacts',
            function (object $row): ?array {
                $officeId = $this->officeIdFromRow($row);
                $userId = $this->nullableId($this->value($row, ['user_id', 'client_user_id']));

                if ($officeId === null || ! $this->destinationExists('offices', $officeId)) {
                    return null;
                }

                if ($userId !== null && ! $this->destinationExists('users', $userId)) {
                    $userId = null;
                }

                $createdAt = $this->legacyDate($this->value($row, ['created_at'])) ?? now();

                return [
                    'id' => $this->id($row),
                    'office_id' => $officeId,
                    'user_id' => $userId,
                    'full_name' => Str::limit($this->string($this->value($row, ['full_name', 'name', 'client_name']), "Legacy contact {$this->id($row)}"), 255, ''),
                    'national_id' => $this->limitNullable($this->digits($this->value($row, ['national_id', 'national_code', 'nation_code'])), 11),
                    'mobile' => $this->normalizeMobile($this->value($row, ['mobile', 'phone'])),
                    'email' => $this->limitNullable($this->value($row, ['email']), 100),
                    'organization' => $this->limitNullable($this->value($row, ['organization', 'company']), 255),
                    'address' => $this->limitNullable($this->value($row, ['address']), 255),
                    'father_name' => $this->limitNullable($this->value($row, ['father_name', 'father']), 55),
                    'notes' => $this->nullableString($this->value($row, ['notes', 'description'])),
                    'created_at' => $createdAt,
                    'updated_at' => $this->legacyDate($this->value($row, ['updated_at'])) ?? $createdAt,
                ];
            }
        );
    }

    private function migrateOfficeCases(bool $dryRun): void
    {
        $requestTypes = $this->requestTypeLookup();

        $this->migrateSimpleLegacyTable(
            $dryRun,
            ['ad_dad_office_cases', 'ad_dad_office_case'],
            'office_cases',
            function (object $row) use ($requestTypes): ?array {
                $officeId = $this->officeIdFromRow($row);

                if ($officeId === null || ! $this->destinationExists('offices', $officeId)) {
                    return null;
                }

                $claimTypeId = $this->claimTypeId($this->value($row, [
                    'claim_type_id',
                    'office_claim_type_id',
                    'claim_id',
                    'claim_type',
                    'claim',
                    'subject_id',
                    'subject',
                ]));

                $cityId = $this->nullableId($this->value($row, ['city_id']));
                if ($cityId !== null && ! $this->destinationExists('cities', $cityId)) {
                    $cityId = null;
                }

                $createdAt = $this->legacyDate($this->value($row, ['created_at'])) ?? now();
                $data = [
                    'id' => $this->id($row),
                    'uuid' => (string) Str::uuid(),
                    'office_id' => $officeId,
                    'case_number' => $this->limitNullable($this->value($row, ['case_number', 'number', 'code']), 255),
                    'archive_number' => $this->limitNullable($this->value($row, ['archive_number', 'archive_no']), 255),
                    'title' => Str::limit($this->string($this->value($row, ['title', 'subject']), "Legacy office case {$this->id($row)}"), 255, ''),
                    'request_type_id' => $this->requestTypeId($this->value($row, ['request_type_id', 'request_type', 'request_type_code', 'type']), $requestTypes),
                    'claim_type_id' => $claimTypeId,
                    'case_branch' => $this->limitNullable($this->value($row, ['case_branch', 'branch']), 255),
                    'city_id' => $cityId,
                    'subscription_id' => null,
                    'status' => $this->caseStatus($this->value($row, ['status'])),
                    'case_fee' => $this->positiveIntegerOrNull($this->value($row, ['case_fee', 'fee', 'price'])),
                    'description' => $this->nullableString($this->value($row, ['description', 'notes'])),
                    'progress' => max(0, min((int) $this->value($row, ['progress', 'pgp'], 0), 100)),
                    'archived_at' => (bool) $this->value($row, ['archived'], false)
                        ? ($this->legacyDate($this->value($row, ['updated_at'])) ?? $createdAt)
                        : $this->legacyDate($this->value($row, ['archived_at'])),
                    'created_at' => $createdAt,
                    'updated_at' => $this->legacyDate($this->value($row, ['updated_at'])) ?? $createdAt,
                    'deleted_at' => $this->legacyDate($this->value($row, ['deleted_at'])),
                ];

                if (Schema::hasColumn('office_cases', 'authority')) {
                    $data['authority'] = $this->authorityName($this->value($row, ['authority', 'court']));
                }

                if (Schema::hasColumn('office_cases', 'authority_id')) {
                    $data['authority_id'] = $this->authorityId($this->value($row, ['authority', 'court']));
                }

                return $data;
            }
        );
    }

    private function mergeOfficeCaseMeta(bool $dryRun): void
    {
        if (! Schema::connection('legacy')->hasTable('ad_dad_office_case_meta')) {
            $this->console->warn('Legacy table was not found for office case meta: ad_dad_office_case_meta.');

            return;
        }

        $this->console->info('Merging ad_dad_office_case_meta into office_cases...');

        $metaByCase = $this->officeCaseMetaByCaseId();
        $bar = $this->console->getOutput()->createProgressBar($metaByCase->count());
        $updated = 0;
        $missingCases = 0;
        $emptyMeta = 0;
        $requestTypes = $this->requestTypeLookup();

        foreach ($metaByCase as $caseId => $meta) {
            if (! $this->destinationExists('office_cases', (int) $caseId)) {
                $missingCases++;
                $bar->advance();

                continue;
            }

            $update = $this->officeCaseMetaUpdate($meta, $requestTypes);

            if ($update === []) {
                $emptyMeta++;
                $bar->advance();

                continue;
            }

            $update['subscription_id'] = $this->subscriptionId($this->metaValue($meta, ['subscription_id', 'conversation_id']));

            if ($dryRun) {
                $this->console->line("office_cases {$caseId} <= ad_dad_office_case_meta");
            } else {
                DB::table('office_cases')->where('id', $caseId)->update($update);
            }

            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->console->newLine();
        $this->console->info("office_cases updated from meta: {$updated}.");
        $this->console->warn("office case meta skipped because case was missing: {$missingCases}.");
        $this->console->warn("office case meta rows with no mapped fields: {$emptyMeta}.");
        $this->console->warn('ad_dad_office_case_meta columns: '.implode(', ', $this->legacyColumns('ad_dad_office_case_meta')));
    }

    private function syncOfficeCaseBaseFields(bool $dryRun): void
    {
        if (! Schema::connection('legacy')->hasTable('ad_dad_office_case')) {
            return;
        }

        $this->console->info('Syncing ad_dad_office_case base fields into office_cases...');

        $query = MigrateHelper::legacy('ad_dad_office_case');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $updated = 0;
        $missingCases = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$updated,
            &$missingCases
        ): void {
            foreach ($rows as $row) {
                if (! $this->destinationExists('office_cases', $this->id($row))) {
                    $missingCases++;
                    $bar->advance();

                    continue;
                }

                $createdAt = $this->legacyDate($this->value($row, ['created_at'])) ?? now();
                $update = [
                    'case_number' => $this->limitNullable($this->value($row, ['case_number', 'number', 'code']), 255),
                    'archive_number' => $this->limitNullable($this->value($row, ['archive_number', 'archive_no']), 255),
                    'title' => Str::limit($this->string($this->value($row, ['title', 'subject']), "Legacy office case {$this->id($row)}"), 255, ''),
                    'status' => $this->caseStatus($this->value($row, ['status'])),
                    'progress' => max(0, min((int) $this->value($row, ['progress', 'pgp'], 0), 100)),
                    'archived_at' => (bool) $this->value($row, ['archived'], false)
                        ? ($this->legacyDate($this->value($row, ['updated_at'])) ?? $createdAt)
                        : null,
                    'subscription_id' => null,
                    'updated_at' => $this->legacyDate($this->value($row, ['updated_at'])) ?? $createdAt,
                ];

                if (Schema::hasColumn('office_cases', 'authority')) {
                    $update['authority'] = $this->authorityName($this->value($row, ['authority', 'court']));
                }

                if (Schema::hasColumn('office_cases', 'authority_id')) {
                    $update['authority_id'] = $this->authorityId($this->value($row, ['authority', 'court']));
                }

                if ($dryRun) {
                    $this->console->line("office_cases {$this->id($row)} <= ad_dad_office_case");
                } else {
                    DB::table('office_cases')->where('id', $this->id($row))->update($update);
                }

                $updated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("office_cases base fields synced: {$updated}.");
        $this->console->warn("office_cases base sync skipped because case was missing: {$missingCases}.");
    }

    private function migrateOfficeCaseParties(bool $dryRun): void
    {
        $this->migrateSimpleLegacyTable(
            $dryRun,
            ['ad_dad_office_case_users', 'ad_dad_office_case_parties', 'ad_dad_office_parties'],
            'office_case_parties',
            function (object $row): ?array {
                $caseId = $this->caseIdFromRow($row);
                $contactId = $this->officeContactId($row);

                if ($caseId === null || ! $this->destinationExists('office_cases', $caseId)) {
                    return null;
                }

                if ($contactId !== null && ! $this->destinationExists('office_contacts', $contactId)) {
                    $contactId = null;
                }

                return [
                    'id' => $this->id($row),
                    'case_id' => $caseId,
                    'contact_id' => $contactId,
                    'role' => Str::limit($this->string($this->value($row, ['role', 'party_role', 'type']), 'client'), 100, ''),
                    'is_client' => (bool) $this->value($row, ['is_client', 'client'], false),
                    'created_at' => $this->legacyDate($this->value($row, ['created_at'])) ?? now(),
                ];
            }
        );
    }

    private function migrateOfficeCaseNotes(bool $dryRun): void
    {
        $this->migrateCaseBoundTable($dryRun, ['ad_dad_office_case_notes', 'ad_dad_office_notes'], 'office_case_notes', function (object $row): array {
            $createdAt = $this->legacyDate($this->value($row, ['created_at', 'updated_at'])) ?? now();

            return [
                'id' => $this->id($row),
                'user_id' => $this->existingUserId($this->value($row, ['user_id', 'created_by'])),
                'type' => Str::limit($this->string($this->value($row, ['type']), 'یادداشت'), 55, ''),
                'text' => $this->nullableString($this->value($row, ['text', 'note', 'body'])),
                'created_at' => $createdAt,
                'updated_at' => $this->legacyDate($this->value($row, ['updated_at'])) ?? $createdAt,
            ];
        });
    }

    private function migrateOfficeCaseActions(bool $dryRun): void
    {
        $this->migrateCaseBoundTable($dryRun, ['ad_dad_office_case_actions', 'ad_dad_office_actions'], 'office_case_actions', fn (object $row): array => [
            'id' => $this->id($row),
            'user_id' => $this->existingUserId($this->value($row, ['user_id', 'created_by'])),
            'action' => $this->string($this->value($row, ['action', 'text', 'description']), "Legacy action {$this->id($row)}"),
            'created_at' => $this->legacyDate($this->value($row, ['created_at'])) ?? now(),
        ]);
    }

    private function migrateOfficeTimeLogs(bool $dryRun): void
    {
        $this->migrateCaseBoundTable($dryRun, ['ad_dad_office_time_logs', 'ad_dad_office_timelogs'], 'office_time_logs', function (object $row): ?array {
            $duration = (float) $this->value($row, ['duration', 'hours', 'time'], 0);

            if ($duration <= 0) {
                return null;
            }

            return [
                'id' => $this->id($row),
                'user_id' => $this->existingUserId($this->value($row, ['user_id', 'created_by'])),
                'duration' => $duration,
                'description' => $this->nullableString($this->value($row, ['description', 'text'])),
                'created_at' => $this->legacyDate($this->value($row, ['created_at'])) ?? now(),
            ];
        }, true);
    }

    private function migrateOfficeCaseTasks(bool $dryRun): void
    {
        $this->migrateCaseBoundTable($dryRun, ['ad_dad_office_case_tasks', 'ad_dad_office_tasks'], 'office_case_tasks', function (object $row): ?array {
            $deadline = $this->legacyDate($this->value($row, [
                'deadline',
                'due_at',
                'due_date',
                'date',
                'task_date',
                'remind_at',
                'reminder_at',
                'created_at',
            ]));

            if ($deadline === null) {
                return null;
            }

            $createdAt = $this->legacyDate($this->value($row, ['created_at'])) ?? now();

            return [
                'id' => $this->id($row),
                'assignee_id' => $this->existingUserId($this->value($row, ['assignee_id', 'asg_id', 'user_id'])),
                'title' => Str::limit($this->string($this->value($row, ['title', 'name']), "Legacy task {$this->id($row)}"), 255, ''),
                'description' => $this->limitNullable($this->value($row, ['description', 'text']), 500),
                'deadline' => $deadline,
                'priority' => $this->taskPriority($this->value($row, ['priority'])),
                'status' => $this->taskStatus($this->value($row, ['status'])),
                'created_at' => $createdAt,
                'updated_at' => $this->legacyDate($this->value($row, ['updated_at'])) ?? $createdAt,
            ];
        });
    }

    private function migrateOfficeCaseEvents(bool $dryRun): void
    {
        $this->migrateCaseBoundTable($dryRun, ['ad_dad_office_case_events', 'ad_dad_office_events'], 'office_case_events', function (object $row): ?array {
            $eventAt = $this->legacyDateTime($row, [
                'event_at',
                'starts_at',
                'start_at',
                'date',
                'event_date',
                'remind_at',
                'reminder_at',
                'created_at',
            ], ['time']);

            if ($eventAt === null) {
                return null;
            }

            return [
                'id' => $this->id($row),
                'title' => Str::limit($this->string($this->value($row, ['title', 'name']), "Legacy event {$this->id($row)}"), 512, ''),
                'type' => Str::limit($this->string($this->value($row, ['type']), 'event'), 100, ''),
                'notes' => $this->nullableString($this->value($row, ['notes', 'description'])),
                'event_at' => $eventAt,
                'reminder_before' => max(0, (int) $this->value($row, ['reminder_before', 'reminder_minutes_before', 'reminder'], 0)),
                'reminder_sent' => (bool) $this->value($row, ['reminder_sent', 'sent'], false),
            ];
        });
    }

    private function migrateOfficeAiCaseAnalyses(bool $dryRun): void
    {
        $this->migrateCaseBoundTable($dryRun, ['ad_dad_office_case_ai', 'ad_dad_office_case_ai', 'ad_dad_office_case_ai_data'], 'office_case_ai', fn (object $row): array => [
            'id' => $this->id($row),
            'service_name' => Str::limit($this->string($this->value($row, ['service_name', 'service']), 'legacy'), 255, ''),
            'model' => Str::limit($this->string($this->value($row, ['model']), 'legacy'), 255, ''),
            'tokens_used' => $this->positiveIntegerOrNull($this->value($row, ['tokens_used', 'tokens'])),
            'result' => $this->json($this->value($row, ['result', 'ai_data', 'data', 'response', 'content'])),
            'created_at' => $this->legacyDate($this->value($row, ['created_at'])) ?? now(),
        ]);
    }

    private function migrateOfficeTransactions(bool $dryRun): void
    {
        $this->migrateOfficeTransactionTable($dryRun, 'ad_dad_office_case_transactions', true);
        $this->migrateOfficeTransactionTable($dryRun, 'ad_dad_office_general_transactions', false);
        $this->migrateOfficeTransactionTable($dryRun, 'ad_dad_office_transactions', null);
        $this->migrateOfficeTransactionTable($dryRun, 'ad_dad_office_financials', null);
    }

    private function migrateOfficeTransactionTable(bool $dryRun, string $legacyTable, ?bool $caseScoped): void
    {
        if (! Schema::connection('legacy')->hasTable($legacyTable)) {
            $this->console->warn("Legacy table was not found for office_transactions: {$legacyTable}.");

            return;
        }

        $this->console->info("Migrating {$legacyTable} to office_transactions...");
        $this->console->line("{$legacyTable} columns: ".implode(', ', $this->legacyColumns($legacyTable)));

        $query = MigrateHelper::legacy($legacyTable);
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            $legacyTable,
            $caseScoped,
            &$migrated,
            &$existing,
            &$invalidRows
        ): void {
            foreach ($rows as $row) {
                $caseId = $caseScoped === false ? null : $this->caseIdFromRow($row);
                $officeId = $this->transactionOfficeIdFromRow($row, $caseId);
                $rawAmount = $this->value($row, ['amount', 'price', 'cost', 'value', 'fee']);
                $amount = $this->positiveAmountOrNull($rawAmount);
                $rawDirection = $this->value($row, ['direction', 'type', 'transaction_type', 'kind', 'side', 'operation']);
                $rawCategory = $this->value($row, ['category', 'category_type', 'transaction_category', 'cat', 'group', 'subject']);

                if ($caseId !== null && $officeId === null) {
                    $officeId = (int) DB::table('office_cases')->where('id', $caseId)->value('office_id');
                }

                if ($officeId === null || $amount === null || ! $this->destinationExists('offices', $officeId)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($caseId !== null && ! $this->destinationExists('office_cases', $caseId)) {
                    $caseId = null;
                }

                $data = [
                    'office_id' => $officeId,
                    'case_id' => $caseId,
                    'recorded_by' => $this->existingUserId($this->value($row, ['recorded_by', 'user_id', 'created_by'])),
                    'correction_of_id' => null,
                    'direction' => $this->transactionDirection($rawDirection, $rawAmount, $rawCategory),
                    'related_party' => $this->relatedParty($this->value($row, ['related_party', 'party', 'party_type', 'related_to', 'for_party'])),
                    'category' => $this->transactionCategory($rawCategory, $rawDirection),
                    'amount' => $amount,
                    'description' => $this->nullableString($this->value($row, ['description', 'text', 'notes', 'title'])),
                    'transaction_at' => $this->legacyDate($this->value($row, ['transaction_at', 'trs_date', 'created_at'])) ?? now(),
                ];

                if ($this->officeTransactionExists($data)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("office_transactions {$legacyTable}:{$this->id($row)}");
                } else {
                    DB::table('office_transactions')->insert($data);
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("office_transactions from {$legacyTable} migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("office_transactions from {$legacyTable} skipped because their data or references were invalid: {$invalidRows}.");
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function officeTransactionExists(array $data): bool
    {
        return DB::table('office_transactions')
            ->where('office_id', $data['office_id'])
            ->where('direction', $data['direction'])
            ->where('amount', $data['amount'])
            ->where('transaction_at', $data['transaction_at'])
            ->where(function ($query) use ($data): void {
                $data['case_id'] === null
                    ? $query->whereNull('case_id')
                    : $query->where('case_id', $data['case_id']);
            })
            ->where(function ($query) use ($data): void {
                $data['description'] === null
                    ? $query->whereNull('description')
                    : $query->where('description', $data['description']);
            })
            ->exists();
    }

    private function migrateOfficeAttachments(bool $dryRun): void
    {
        $this->migrateSimpleLegacyTable(
            $dryRun,
            ['ad_dad_office_case_files', 'ad_dad_office_attachments', 'ad_dad_office_files'],
            'office_attachments',
            function (object $row): ?array {
                $officeId = $this->officeIdFromRow($row);
                $caseId = $this->caseIdFromRow($row);
                $attachmentId = $this->officeAttachmentId($this->value($row, ['attachment_id', 'file_id', 'file_url']));

                if ($caseId !== null && $officeId === null) {
                    $officeId = (int) DB::table('office_cases')->where('id', $caseId)->value('office_id');
                }

                if ($officeId === null
                    || $attachmentId === null
                    || ! $this->destinationExists('offices', $officeId)
                    || ! $this->destinationExists('attachments', $attachmentId)) {
                    return null;
                }

                if ($caseId !== null && ! $this->destinationExists('office_cases', $caseId)) {
                    $caseId = null;
                }

                return [
                    'id' => $this->id($row),
                    'office_id' => $officeId,
                    'case_id' => $caseId,
                    'attachment_id' => $attachmentId,
                    'uploaded_by' => $this->existingUserId($this->value($row, ['uploaded_by', 'user_id', 'created_by'])),
                    'title' => $this->limitNullable($this->value($row, ['title', 'name']), 255),
                    'type' => $this->limitNullable($this->value($row, ['type']), 100),
                    'created_at' => $this->legacyDate($this->value($row, ['created_at'])) ?? now(),
                ];
            }
        );
    }

    private function officeAttachmentId(mixed $value): ?int
    {
        $id = $this->nullableId($value);

        if ($id !== null && $this->destinationExists('attachments', $id)) {
            return $id;
        }

        foreach ($this->officeFileStorageKeyCandidates($value) as $storageKey) {
            $attachmentId = DB::table('attachments')
                ->where('storage_key', $storageKey)
                ->value('id');

            if ($attachmentId !== null) {
                return (int) $attachmentId;
            }
        }

        return null;
    }

    private function officeContactId(object $row): ?int
    {
        $contactId = $this->nullableId($this->value($row, ['contact_id', 'client_id', 'office_contact_id']));

        if ($contactId !== null && $this->destinationExists('office_contacts', $contactId)) {
            return $contactId;
        }

        $caseId = $this->caseIdFromRow($row);
        $officeId = $this->officeIdFromRow($row);

        if ($caseId !== null && $officeId === null) {
            $officeId = (int) DB::table('office_cases')->where('id', $caseId)->value('office_id');
        }

        if ($officeId === null) {
            return null;
        }

        $userId = $this->nullableId($this->value($row, ['user_id']));
        if ($userId !== null) {
            $contactId = DB::table('office_contacts')
                ->where('office_id', $officeId)
                ->where('user_id', $userId)
                ->value('id');

            if ($contactId !== null) {
                return (int) $contactId;
            }
        }

        $mobile = $this->normalizeMobile($this->value($row, ['mobile', 'phone']));
        if ($mobile !== null) {
            $contactId = DB::table('office_contacts')
                ->where('office_id', $officeId)
                ->where('mobile', $mobile)
                ->value('id');

            if ($contactId !== null) {
                return (int) $contactId;
            }
        }

        return null;
    }

    /**
     * @return list<string>
     */
    private function officeFileStorageKeyCandidates(mixed $value): array
    {
        if (blank($value)) {
            return [];
        }

        $path = parse_url((string) $value, PHP_URL_PATH) ?: (string) $value;
        $path = ltrim(rawurldecode($path), '/');

        if ($path === '') {
            return [];
        }

        $candidates = [$path];
        $legacyPrefix = 'wp-content/uploads/dadline/';

        if (str_starts_with($path, $legacyPrefix)) {
            $candidates[] = 'private/'.substr($path, strlen($legacyPrefix));
        }

        if (! str_starts_with($path, 'private/')) {
            $candidates[] = 'private/'.$path;
        }

        return array_values(array_unique(array_filter($candidates)));
    }

    /**
     * @param  list<string>  $legacyTables
     * @param  callable(object): ?array<string, mixed>  $map
     */
    private function migrateSimpleLegacyTable(bool $dryRun, array $legacyTables, string $destinationTable, callable $map): void
    {
        $legacyTable = $this->firstExistingTable($legacyTables);

        if ($legacyTable === null) {
            $this->console->warn('Legacy table was not found for '.$destinationTable.'. Tried: '.implode(', ', $legacyTables).'.');

            return;
        }

        $this->console->info("Migrating {$legacyTable} to {$destinationTable}...");

        $query = MigrateHelper::legacy($legacyTable);
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            $destinationTable,
            $map,
            &$migrated,
            &$existing,
            &$invalidRows
        ): void {
            $existingIds = DB::table($destinationTable)
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($this->id($row))) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                $data = $map($row);

                if ($data === null) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("{$destinationTable} {$this->id($row)}");
                } else {
                    DB::table($destinationTable)->insert($data);
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("{$destinationTable} migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("{$destinationTable} skipped because their data or references were invalid: {$invalidRows}.");

        if ($migrated === 0 && $invalidRows > 0) {
            $this->console->warn("{$legacyTable} columns: ".implode(', ', $this->legacyColumns($legacyTable)));
        }
    }

    /**
     * @param  list<string>  $legacyTables
     * @param  callable(object): ?array<string, mixed>  $map
     */
    private function migrateCaseBoundTable(bool $dryRun, array $legacyTables, string $destinationTable, callable $map, bool $caseNullable = false): void
    {
        $this->migrateSimpleLegacyTable($dryRun, $legacyTables, $destinationTable, function (object $row) use ($map, $caseNullable): ?array {
            $caseId = $this->caseIdForWorkflowRow($row);

            if ($caseId === null && ! $caseNullable) {
                return null;
            }

            if ($caseId !== null && ! $this->destinationExists('office_cases', $caseId)) {
                return null;
            }

            $data = $map($row);

            if ($data === null) {
                return null;
            }

            return ['case_id' => $caseId] + $data;
        });
    }

    /**
     * @param  list<string>  $tables
     */
    private function firstExistingTable(array $tables): ?string
    {
        foreach ($tables as $table) {
            if (Schema::connection('legacy')->hasTable($table)) {
                return $table;
            }
        }

        return null;
    }

    /**
     * @param  list<string>  $keys
     */
    private function value(object $row, array $keys, mixed $default = null): mixed
    {
        foreach ($keys as $key) {
            if (property_exists($row, $key)) {
                return $row->{$key};
            }
        }

        return $default;
    }

    private function officeIdFromRow(object $row): ?int
    {
        return $this->nullableId($this->value($row, ['office_id']))
            ?? $this->nullableId($this->value($row, ['lawyer_id']))
            ?? $this->nullableId($this->value($row, ['vendor_id']));
    }

    private function transactionOfficeIdFromRow(object $row, ?int $caseId): ?int
    {
        $officeId = $this->officeIdFromRow($row);

        if ($officeId !== null) {
            return $officeId;
        }

        if ($caseId !== null) {
            $caseOfficeId = DB::table('office_cases')->where('id', $caseId)->value('office_id');

            if ($caseOfficeId !== null) {
                return (int) $caseOfficeId;
            }
        }

        $userId = $this->nullableId($this->value($row, ['owner_id', 'user_id']));

        if ($userId === null) {
            return null;
        }

        $officeIds = DB::table('offices')->where('owner_id', $userId)->pluck('id');

        return $officeIds->count() === 1 ? (int) $officeIds->first() : null;
    }

    private function officeName(int $ownerId): string
    {
        $columns = collect(['first_name', 'last_name', 'name', 'full_name'])
            ->filter(fn (string $column): bool => Schema::hasColumn('users', $column))
            ->values()
            ->all();

        $fullName = null;

        if ($columns !== []) {
            $user = DB::table('users')->where('id', $ownerId)->first($columns);

            if ($user !== null) {
                $fullName = $this->nullableString(trim(implode(' ', array_filter([
                    $this->value($user, ['first_name']),
                    $this->value($user, ['last_name']),
                    $this->value($user, ['name']),
                    $this->value($user, ['full_name']),
                ], fn (mixed $value): bool => ! blank($value)))));
            }
        }

        return Str::limit('دفتر وکالت '.($fullName ?? "کاربر {$ownerId}"), 255, '');
    }

    private function caseIdFromRow(object $row): ?int
    {
        return $this->nullableId($this->value($row, [
            'case_id',
            'office_case_id',
            'office_cases_id',
            'dad_office_case_id',
            'ref_case_id',
            'related_case_id',
            'ref_id',
            'case',
        ])) ?? $this->caseIdFromLegacyCode($this->value($row, ['case_code', 'code']));
    }

    private function caseIdFromLegacyCode(mixed $value): ?int
    {
        $code = trim((string) $value);

        if ($code === '') {
            return null;
        }

        if (array_key_exists($code, $this->caseIdByLegacyCode)) {
            return $this->caseIdByLegacyCode[$code];
        }

        if (! Schema::connection('legacy')->hasTable('ad_dad_office_case')) {
            $this->caseIdByLegacyCode[$code] = null;

            return null;
        }

        $legacyCaseId = MigrateHelper::legacy('ad_dad_office_case')
            ->where('code', $code)
            ->value('id');
        $caseId = $this->nullableId($legacyCaseId);

        $this->caseIdByLegacyCode[$code] = $caseId !== null && $this->destinationExists('office_cases', $caseId)
            ? $caseId
            : null;

        return $this->caseIdByLegacyCode[$code];
    }

    private function officeCaseMetaByCaseId(): Collection
    {
        $table = 'ad_dad_office_case_meta';
        $columns = $this->legacyColumns($table);
        $query = MigrateHelper::legacy($table);
        $metaByCase = collect();

        if (in_array('meta_key', $columns, true) && in_array('meta_value', $columns, true)) {
            foreach ($query->orderBy('id')->cursor() as $row) {
                $caseId = $this->caseIdFromRow($row);

                if ($caseId === null) {
                    continue;
                }

                $key = $this->nullableString($this->value($row, ['meta_key']));

                if ($key === null) {
                    continue;
                }

                $meta = $metaByCase->get($caseId, []);
                $meta[$key] = $this->value($row, ['meta_value']);
                $metaByCase->put($caseId, $meta);
            }

            return $metaByCase;
        }

        foreach ($query->orderBy('id')->cursor() as $row) {
            $caseId = $this->caseIdFromRow($row);

            if ($caseId === null) {
                continue;
            }

            $meta = $metaByCase->get($caseId, []);

            foreach ($columns as $column) {
                if (in_array($column, ['id', 'case_id', 'office_case_id', 'case_code', 'code', 'created_at', 'updated_at'], true)) {
                    continue;
                }

                $meta[$column] = $this->value($row, [$column]);
            }

            $metaByCase->put($caseId, $meta);
        }

        return $metaByCase;
    }

    private function officeCaseMetaUpdate(array $meta, Collection $requestTypes): array
    {
        $requestTypeId = $this->requestTypeId($this->metaValue($meta, [
            'request_type_id',
            'request_type',
            'request_type_code',
            'type',
            'petition_type',
            'doc_type',
        ]), $requestTypes);
        $claimTypeId = $this->claimTypeId($this->metaValue($meta, [
            'claim_type_id',
            'office_claim_type_id',
            'claim_id',
            'claim_type',
            'claim',
            'subject_id',
            'subject',
            'case_subject',
            'case_type',
        ]));
        $cityId = $this->nullableId($this->metaValue($meta, ['city_id']));

        $update = ['request_type_id' => $requestTypeId];

        if ($claimTypeId !== null) {
            $update['claim_type_id'] = $claimTypeId;
        }

        $authorityValue = $this->metaValue($meta, [
            'authority_id',
            'referral_authority_id',
            'referral_authority',
            'authority',
            'court',
        ]);

        if (Schema::hasColumn('office_cases', 'authority') && ($authority = $this->authorityName($authorityValue)) !== null) {
            $update['authority'] = $authority;
        }

        if (Schema::hasColumn('office_cases', 'authority_id')) {
            $update['authority_id'] = $this->authorityId($authorityValue);
        }

        if (($caseBranch = $this->limitNullable($this->metaValue($meta, ['case_branch', 'branch']), 255)) !== null) {
            $update['case_branch'] = $caseBranch;
        }

        if ($cityId !== null && $this->destinationExists('cities', $cityId)) {
            $update['city_id'] = $cityId;
        }

        if (($caseFee = $this->positiveIntegerOrNull($this->metaValue($meta, ['case_fee', 'fee', 'price']))) !== null) {
            $update['case_fee'] = $caseFee;
        }

        if (($description = $this->nullableString($this->metaValue($meta, ['description', 'notes', 'text']))) !== null) {
            $update['description'] = $description;
        }

        return $update;
    }

    /**
     * @param  list<string>  $keys
     */
    private function metaValue(array $meta, array $keys): mixed
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $meta)) {
                return $meta[$key];
            }
        }

        return null;
    }

    private function caseIdForWorkflowRow(object $row): ?int
    {
        $caseId = $this->caseIdFromRow($row);

        if ($caseId !== null) {
            return $caseId;
        }

        $officeId = $this->officeIdFromRow($row);

        if ($officeId === null) {
            return null;
        }

        return $this->singleCaseIdForOffice($officeId);
    }

    private function singleCaseIdForOffice(int $officeId): ?int
    {
        if (array_key_exists($officeId, $this->singleCaseIdByOffice)) {
            return $this->singleCaseIdByOffice[$officeId];
        }

        $caseIds = DB::table('office_cases')
            ->where('office_id', $officeId)
            ->orderBy('id')
            ->limit(2)
            ->pluck('id');

        $this->singleCaseIdByOffice[$officeId] = $caseIds->count() === 1 ? (int) $caseIds->first() : null;

        return $this->singleCaseIdByOffice[$officeId];
    }

    private function firstExistingUserId(Collection|array $ids): ?int
    {
        foreach ($ids as $id) {
            $userId = $this->nullableId($id);

            if ($userId !== null && $this->destinationExists('users', $userId)) {
                return $userId;
            }
        }

        return null;
    }

    private function syntheticOfficeRows(): Collection
    {
        $tables = [
            'ad_dad_office_contacts',
            'ad_dad_office_clients',
            'ad_dad_office_case',
            'ad_dad_office_cases',
            'ad_dad_office_case_notes',
            'ad_dad_office_case_actions',
            'ad_dad_office_case_tasks',
            'ad_dad_office_case_events',
            'ad_dad_office_time_logs',
        ];
        $officeRows = collect();

        foreach ($tables as $table) {
            if (! Schema::connection('legacy')->hasTable($table)) {
                continue;
            }

            $columns = $this->legacyColumns($table);
            $select = collect([
                'id',
                'office_id',
                'owner_id',
                'lawyer_id',
                'vendor_id',
                'user_id',
                'created_by',
                'created_at',
            ])
                ->intersect($columns)
                ->values()
                ->all();

            if (! in_array('office_id', $select, true)
                && ! in_array('lawyer_id', $select, true)
                && ! in_array('vendor_id', $select, true)) {
                continue;
            }

            foreach (MigrateHelper::legacy($table)->select($select)->orderBy('id')->cursor() as $row) {
                $officeId = $this->officeIdFromRow($row);

                if ($officeId === null || $officeRows->has($officeId)) {
                    continue;
                }

                $officeRows->put($officeId, [
                    'owner_candidates' => collect([
                        $this->value($row, ['owner_id']),
                        $this->value($row, ['lawyer_id']),
                        $this->value($row, ['vendor_id']),
                        $this->value($row, ['user_id']),
                        $this->value($row, ['created_by']),
                        $officeId,
                    ])->filter(fn (mixed $value): bool => $this->nullableId($value) !== null),
                    'created_at' => $this->legacyDate($this->value($row, ['created_at'])),
                ]);
            }
        }

        return $officeRows;
    }

    /**
     * @return list<string>
     */
    private function legacyColumns(string $table): array
    {
        return Schema::connection('legacy')->getColumnListing($table);
    }

    private function id(object $row): int
    {
        return (int) $this->value($row, ['id']);
    }

    private function nullableId(mixed $value): ?int
    {
        if (blank($value) || ! is_numeric($value)) {
            return null;
        }

        $id = (int) $value;

        return $id > 0 ? $id : null;
    }

    private function existingUserId(mixed $value): ?int
    {
        $userId = $this->nullableId($value);

        return $userId !== null && $this->destinationExists('users', $userId) ? $userId : null;
    }

    private function subscriptionId(mixed $value): ?int
    {
        $subscriptionId = $this->nullableId($value);

        return $subscriptionId !== null && $this->destinationExists('consultation_subscriptions', $subscriptionId)
            ? $subscriptionId
            : null;
    }

    private function destinationExists(string $table, int $id): bool
    {
        return DB::table($table)->where('id', $id)->exists();
    }

    private function string(mixed $value, string $default): string
    {
        $value = trim((string) $value);

        return $value === '' ? $default : $value;
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function limitNullable(mixed $value, int $limit): ?string
    {
        $value = $this->nullableString($value);

        return $value === null ? null : Str::limit($value, $limit, '');
    }

    private function digits(mixed $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $value);

        return $digits === '' ? null : $digits;
    }

    private function normalizeMobile(mixed $value): ?string
    {
        $digits = $this->digits($value);

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

    private function positiveIntegerOrNull(mixed $value): ?int
    {
        if (! is_numeric($value)) {
            return null;
        }

        $amount = (int) $value;

        return $amount > 0 ? $amount : null;
    }

    private function positiveAmountOrNull(mixed $value): ?int
    {
        if (! is_numeric($value)) {
            return null;
        }

        $amount = abs((int) $value);

        return $amount > 0 ? $amount : null;
    }

    private function json(mixed $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        if (is_string($value)) {
            json_decode($value);

            if (json_last_error() === JSON_ERROR_NONE) {
                return $value;
            }
        }

        try {
            return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        } catch (\JsonException) {
            return null;
        }
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

    /**
     * @param  list<string>  $dateKeys
     * @param  list<string>  $timeKeys
     */
    private function legacyDateTime(object $row, array $dateKeys, array $timeKeys): ?CarbonImmutable
    {
        $date = $this->value($row, $dateKeys);
        $time = $this->value($row, $timeKeys);

        if (filled($date) && filled($time) && ! str_contains((string) $date, ':')) {
            return $this->legacyDate(trim((string) $date).' '.trim((string) $time));
        }

        return $this->legacyDate($date);
    }

    private function officeStatus(mixed $status): string
    {
        return match (strtolower(trim((string) $status))) {
            'deprived' => 'deprived',
            'disabled', 'inactive' => 'disabled',
            default => 'active',
        };
    }

    private function memberRole(mixed $role): string
    {
        return match (strtolower(trim((string) $role))) {
            'owner' => 'owner',
            'partner' => 'partner',
            'associate' => 'associate',
            default => 'secretary',
        };
    }

    private function claimCategory(mixed $category): string
    {
        return match (trim((string) $category)) {
            'کیفری', 'criminal' => 'کیفری',
            'اداری', 'administrative', 'admin' => 'اداری',
            default => 'حقوقی',
        };
    }

    private function requestTypeId(mixed $value, Collection $requestTypes): ?int
    {
        if (is_numeric($value) && DB::table('office_request_types')->where('id', (int) $value)->exists()) {
            return (int) $value;
        }

        $code = $this->requestTypeCode($value);

        if ($code === null) {
            return null;
        }

        $id = $requestTypes->get($code);

        return $id === null ? null : (int) $id;
    }

    private function requestTypeCode(mixed $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        return match (strtolower(trim((string) $value))) {
            'criminal_complaint', 'complaint', 'شکواییه' => 'criminal_complaint',
            'appeal', 'تجدیدنظرخواهی' => 'appeal',
            'criminal_retrial' => 'criminal_retrial',
            'civil_retrial' => 'civil_retrial',
            'order_objection' => 'order_objection',
            'third_party_objection' => 'third_party_objection',
            'counterclaim' => 'counterclaim',
            'third_party_joinder' => 'third_party_joinder',
            'third_party_intervention' => 'third_party_intervention',
            'default_judgment_objection' => 'default_judgment_objection',
            'other' => 'other',
            'initial_petition', 'petition', 'دادخواست بدوی' => 'initial_petition',
            default => $this->legacyCodeSlug($value),
        };
    }

    private function legacyCodeSlug(mixed $value): string
    {
        $slug = Str::slug((string) $value, '_');

        return $slug === '' ? 'legacy_'.substr(md5((string) $value), 0, 12) : Str::limit($slug, 50, '');
    }

    private function requestTypeLookup(): Collection
    {
        return DB::table('office_request_types')
            ->get(['id', 'code', 'name'])
            ->flatMap(fn (object $row): array => array_filter([
                $row->code => (int) $row->id,
                $this->requestTypeCode($row->name) => (int) $row->id,
            ], fn (mixed $value, mixed $key): bool => $key !== null, ARRAY_FILTER_USE_BOTH));
    }

    /**
     * @param  list<array{id: int|string, name: string}>  $fallback
     * @return list<array{id: int|string, name: string}>
     */
    private function legalOptionRows(string $key, array $fallback): array
    {
        if (! Schema::hasTable('options')) {
            return $fallback;
        }

        $value = DB::table('options')
            ->where('group', 'legal')
            ->where('key', $key)
            ->value('value');

        if ($value === null) {
            return $fallback;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
        } else {
            $decoded = $value;
        }

        if (! is_array($decoded)) {
            return $fallback;
        }

        return collect($decoded)
            ->map(function (mixed $row): ?array {
                if (! is_array($row) || ! isset($row['id'], $row['name'])) {
                    return null;
                }

                return [
                    'id' => $row['id'],
                    'name' => (string) $row['name'],
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  list<array{id: int|string, name: string}>  $rows
     * @param  callable(array{id: int|string, name: string}): array<string, mixed>  $map
     */
    private function upsertReferenceRows(bool $dryRun, string $table, array $rows, callable $map): void
    {
        $bar = $this->console->getOutput()->createProgressBar(count($rows));
        $migrated = 0;
        $invalidRows = 0;

        foreach ($rows as $row) {
            $data = $map($row);
            $id = $this->nullableId($data['id'] ?? null);

            if ($id === null) {
                $invalidRows++;
                $bar->advance();

                continue;
            }

            if ($dryRun) {
                $this->console->line("{$table} {$id}");
            } else {
                DB::table($table)->updateOrInsert(['id' => $id], $data);
            }

            $migrated++;
            $bar->advance();
        }

        $bar->finish();
        $this->console->newLine();
        $this->console->info("{$table} migrated or updated: {$migrated}.");
        $this->console->warn("{$table} skipped because their data was invalid: {$invalidRows}.");
    }

    private function authorityId(mixed $value): ?int
    {
        if (! Schema::hasTable('office_referral_authorities')) {
            return null;
        }

        $id = $this->nullableId($value);

        if ($id !== null && $this->destinationExists('office_referral_authorities', $id)) {
            return $id;
        }

        $name = $this->normalizedPersianText($value);

        if ($name === null) {
            return null;
        }

        $matches = DB::table('office_referral_authorities')
            ->whereRaw("regexp_replace(trim(name), '\\s+', ' ', 'g') = ?", [$name])
            ->pluck('id');

        return $matches->count() === 1 ? (int) $matches->first() : null;
    }

    private function authorityName(mixed $value): ?string
    {
        $id = $this->authorityId($value);

        if ($id !== null) {
            return DB::table('office_referral_authorities')->where('id', $id)->value('name');
        }

        return $this->limitNullable($value, 255);
    }

    private function claimTypeId(mixed $value): ?int
    {
        $id = $this->nullableId($value);

        if ($id !== null && $this->destinationExists('office_claim_types', $id)) {
            return $id;
        }

        $name = $this->normalizedPersianText($value);

        if ($name === null) {
            return null;
        }

        $matches = DB::table('office_claim_types')
            ->whereRaw("regexp_replace(trim(name), '\\s+', ' ', 'g') = ?", [$name])
            ->pluck('id');

        return $matches->count() === 1 ? (int) $matches->first() : null;
    }

    private function normalizedPersianText(mixed $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        $value = str_replace(["\u{200c}", 'ي', 'ك'], [' ', 'ی', 'ک'], $value);
        $value = preg_replace('/\s+/u', ' ', $value);

        return $value === null || $value === '' ? null : $value;
    }

    private function caseStatus(mixed $status): string
    {
        $status = strtolower(trim((string) $status));

        return $status === '' ? 'intake' : Str::limit($status, 30, '');
    }

    private function taskPriority(mixed $priority): string
    {
        return match (strtolower(trim((string) $priority))) {
            'low' => 'low',
            'high' => 'high',
            default => 'medium',
        };
    }

    private function taskStatus(mixed $status): string
    {
        return match (strtolower(trim((string) $status))) {
            'in_progress', 'doing' => 'in_progress',
            'completed', 'done' => 'completed',
            'on_hold' => 'on_hold',
            default => 'todo',
        };
    }

    private function transactionDirection(mixed $direction, mixed $amount = null, mixed $category = null): string
    {
        $expenseExact = [
            'expense',
            'withdraw',
            'withdrawal',
            'debit',
            'out',
            'pay',
            'paid',
            'payment',
            'cost',
            'هزینه',
            'خرج',
            'پرداخت',
            'برداشت',
            'بدهکار',
        ];
        $incomeExact = [
            'income',
            'deposit',
            'credit',
            'in',
            'recive',
            'receive',
            'received',
            'receipt',
            'درآمد',
            'دریافت',
            'واریز',
            'بستانکار',
        ];

        $tokens = [
            strtolower(trim((string) $direction)),
            strtolower(trim((string) $category)),
            $this->normalizedPersianText($direction) ?? '',
            $this->normalizedPersianText($category) ?? '',
        ];

        foreach ($tokens as $token) {
            if ($token === '') {
                continue;
            }

            if (in_array($token, $expenseExact, true)
                || Str::contains($token, ['هزینه', 'خرج', 'پرداخت', 'برداشت', 'بدهکار'])) {
                return 'expense';
            }

            if (in_array($token, $incomeExact, true)
                || Str::contains($token, ['درآمد', 'دریافت', 'واریز', 'بستانکار'])) {
                return 'income';
            }
        }

        if (is_numeric($amount) && (int) $amount < 0) {
            return 'expense';
        }

        return 'income';
    }

    private function relatedParty(mixed $party): ?string
    {
        $party = $this->normalizedPersianText($party);

        return match (strtolower((string) $party)) {
            'client', 'customer', 'موکل', 'مشتری' => 'client',
            'lawyer', 'attorney', 'وکیل' => 'lawyer',
            'other', 'سایر', 'متفرقه' => 'other',
            default => null,
        };
    }

    private function transactionCategory(mixed $category, mixed $direction): ?string
    {
        $category = $this->limitNullable($category, 255);

        if ($category === null) {
            return null;
        }

        $normalized = strtolower($this->normalizedPersianText($category) ?? '');

        if (in_array($normalized, [
            'income',
            'expense',
            'deposit',
            'withdraw',
            'withdrawal',
            'credit',
            'debit',
            'in',
            'out',
            'درآمد',
            'هزینه',
            'دریافت',
            'پرداخت',
        ], true)) {
            return null;
        }

        return $category;
    }
}
