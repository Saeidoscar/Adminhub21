<?php

namespace App\Console\Commands;

use App\Enums\VendorService as VendorServiceType;
use App\Enums\VendorType;
use App\Models\ConsultationSubscription;
use App\Models\LegalCategory;
use App\Models\PhoneConsultation;
use App\Models\User;
use App\Models\VendorApplication;
use App\Models\VendorProfile;
use App\Models\VendorService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Throwable;

class MigratePart2
{
    private const CHUNK_SIZE = 500;

    public function __construct(
        private Command $console
    ) {}

    public function migrateVendorProfile(bool $dryRun): void
    {
        $this->console->info('Migrating Vendor Profiles...');

        $query = MigrateHelper::legacy('ad_dad_vendormeta');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $skipped = 0;

        $query->orderBy('user_id')->chunkById(self::CHUNK_SIZE, function (Collection $vendors) use (
            $dryRun,
            $bar,
            &$migrated,
            &$skipped
        ): void {
            $userIds = $vendors->pluck('user_id')->filter()->unique()->values();
            $postIds = $vendors->pluck('post_id')->filter()->unique()->values();
            $users = User::whereIn('id', $userIds)->get()->keyBy('id');
            $extras = MigrateHelper::legacy('ad_dad_vendor_extra_meta')
                ->whereIn('user_id', $userIds)
                ->get()
                ->keyBy('user_id');
            $slugs = MigrateHelper::legacy('ad_posts')
                ->whereIn('ID', $postIds)
                ->pluck('post_name', 'ID');

            foreach ($vendors as $vendor) {
                $user = $users->get($vendor->user_id);
                $vendorType = $user ? $this->vendorType($user) : null;

                if ($vendorType === null) {
                    $skipped++;
                    $bar->advance();

                    continue;
                }

                $extra = $extras->get($vendor->user_id);
                $data = [
                    'slug' => $vendor->post_id ? $slugs->get($vendor->post_id) : null,
                    'vendor_type' => $vendorType,
                    'documents' => null,
                    'profile' => [
                        'tagline' => null,
                        'biography' => $extra?->biography,
                        'work_history' => $extra?->works,
                        'education' => $extra?->education,
                    ],
                    'license' => [
                        'issuer' => $extra?->authority_issuer,
                        'number' => $extra?->authority_number,
                        'expires_at' => $extra?->expired_at,
                    ],
                    'is_active' => true,
                ];

                if ($dryRun) {
                    $this->console->line("User {$user->id} => vendor-profile");
                } else {
                    VendorProfile::updateOrCreate(['user_id' => $user->id], $data);
                }

                $migrated++;
                $bar->advance();
            }
        }, 'user_id');

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Vendor profiles migrated: {$migrated}; skipped: {$skipped}.");
    }

    public function migrateVendorServices(bool $dryRun): void
    {
        $this->console->info('Migrating Vendor Services...');

        $query = MigrateHelper::legacy('ad_dad_vendormeta');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $skipped = 0;

        $query->orderBy('user_id')->chunkById(self::CHUNK_SIZE, function (Collection $vendors) use (
            $dryRun,
            $bar,
            &$migrated,
            &$skipped
        ): void {
            $users = User::whereIn('id', $vendors->pluck('user_id')->filter()->unique())
                ->get()
                ->keyBy('id');
            $upserts = [];
            $now = now();

            foreach ($vendors as $vendor) {
                $user = $users->get($vendor->user_id);

                if (! $user || $this->vendorType($user) === null) {
                    $skipped++;
                    $bar->advance();

                    continue;
                }

                foreach ($this->services($vendor) as $service => $data) {
                    if ($dryRun) {
                        $this->console->line("User {$user->id} => {$service}");
                    } else {
                        $upserts[] = [
                            'user_id' => $user->id,
                            'service' => $service,
                            'enabled' => $data['enabled'],
                            'price' => $data['price'],
                            'settings' => $data['settings'] === null
                                ? null
                                : json_encode($data['settings'], JSON_THROW_ON_ERROR),
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }

                    $migrated++;
                }

                $bar->advance();
            }

            if ($upserts !== []) {
                VendorService::upsert(
                    $upserts,
                    ['user_id', 'service'],
                    ['enabled', 'price', 'settings', 'updated_at']
                );
            }
        }, 'user_id');

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Vendor services migrated: {$migrated}; vendors skipped: {$skipped}.");
    }

    public function migrateVendorApplications(bool $dryRun): void
    {
        $this->console->info('Migrating Vendor Applications...');

        $query = MigrateHelper::legacy('ad_dad_become_vendor');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$invalidRows
        ): void {
            $existingIds = VendorApplication::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $users = User::query()
                ->whereIn('id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->user_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $targetRole = $this->targetRole($row->role ?? null);
                $status = $this->applicationStatus($row->status ?? null);

                if ($targetRole === 'senyor_legal_expert') {
                    $targetRole = 'senior_legal_expert';
                }

                if ($targetRole === null || $status === null || (int) $row->price < 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Vendor application {$row->id} => user {$row->user_id}");
                } else {
                    $application = new VendorApplication;
                    $application->id = $row->id;
                    $application->fill([
                        'user_id' => $row->user_id,
                        'target_role' => $targetRole,
                        'price' => $row->price,
                        'message' => $row->msg,
                        'status' => $status,
                    ]);
                    $application->created_at = $this->legacyDate($row->created_at ?? null) ?? now();
                    $application->updated_at = $this->legacyDate($row->updated_at ?? null) ?? $application->created_at;
                    $application->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Vendor applications migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Vendor applications skipped because the user was missing: {$missingUsers}.");
        $this->console->warn("Vendor applications skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateConsultationSubscriptions(bool $dryRun): void
    {
        $this->console->info('Migrating Consultation Subscriptions...');

        $query = MigrateHelper::legacy('ad_dad_lawyer_subscription');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$invalidRows
        ): void {
            $existingLegacyIds = ConsultationSubscription::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $users = User::query()
                ->whereIn(
                    'id',
                    $rows->pluck('user_id')->merge($rows->pluck('vendor_id'))->filter()->unique()
                )
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingLegacyIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->user_id) || ! $users->has($row->vendor_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $purchased = (int) $row->buy_dadcoin;
                $used = (int) ($row->used_dadcoin ?? 0);

                if ($purchased < 0
                    || $used < 0
                    || $used > $purchased) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $data = [
                    'id' => $row->id,
                    'client_id' => $row->user_id,
                    'vendor_id' => $row->vendor_id,
                    'purchased' => $purchased,
                    'used' => $used,
                    'is_read' => (bool) $row->is_read,
                ];

                if ($dryRun) {
                    $this->console->line("Consultation subscription {$row->id} => client {$row->user_id}, vendor {$row->vendor_id}");
                } else {
                    $subscription = ConsultationSubscription::updateOrCreate(
                        ['client_id' => $row->user_id, 'vendor_id' => $row->vendor_id],
                        $data
                    );
                    $subscription->created_at = $this->legacyDate($row->created_at ?? null) ?? now();
                    $subscription->updated_at = $this->legacyDate($row->updated_at ?? null) ?? $subscription->created_at;
                    $subscription->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Consultation subscriptions migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Consultation subscriptions skipped because a user was missing: {$missingUsers}.");
        $this->console->warn("Consultation subscriptions skipped because their data was invalid: {$invalidRows}.");
    }

    public function migratePhoneConsultations(bool $dryRun): void
    {
        $this->console->info('ad_dad_phone_conseling to phone_consultations...');

        $query = MigrateHelper::legacy('ad_dad_phone_conseling');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $missingCategories = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$missingCategories,
            &$invalidRows
        ): void {
            $existingIds = PhoneConsultation::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $userIds = $rows->pluck('user_id')
                ->merge($rows->pluck('vendor_id'))
                ->filter()
                ->unique();
            $users = User::whereIn('id', $userIds)
                ->pluck('id')
                ->flip();
            $categories = LegalCategory::whereIn('slug', $rows->pluck('category')->filter()->unique())
                ->pluck('id', 'slug');

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->user_id) || ($row->vendor_id !== null && ! $users->has($row->vendor_id))) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $status = $this->phoneConsultationStatus($row->status);
                $categoryId = $categories->get($row->category);

                if ($status === null
                    || ! in_array($row->role, ['expert', 'lawyer', 'vip'], true)
                    || blank($row->category)
                    || (int) $row->time < 0
                    || (int) $row->price < 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($categoryId === null) {
                    $missingCategories++;
                    $bar->advance();

                    continue;
                }

                if (! $dryRun) {
                    $consultation = new PhoneConsultation;
                    $consultation->id = $row->id;
                    $consultation->fill([
                        'user_id' => $row->user_id,
                        'vendor_id' => $row->vendor_id,
                        'category_id' => $categoryId,
                        'text' => $row->text,
                        'vendor_role' => $row->role,
                        'minutes' => $row->time,
                        'price' => $row->price,
                        'status' => $status,
                        'expires_at' => $row->expire_at,
                    ]);
                    $consultation->created_at = $this->legacyDate($row->created_at ?? null) ?? now();
                    $consultation->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Phone consultations migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Phone consultations skipped because a user was missing: {$missingUsers}.");
        $this->console->warn("Phone consultations skipped because the category was missing: {$missingCategories}.");
        $this->console->warn("Phone consultations skipped because their data was invalid: {$invalidRows}.");
    }

    private function phoneConsultationStatus(?string $status): ?string
    {
        return match ($status) {
            'submited', 'submitted', null, '' => 'submitted',
            'calling' => 'calling',
            'answered' => 'answered',
            'canceled', 'cancelled' => 'canceled',
            default => null,
        };
    }

    private function vendorType(User $user): ?VendorType
    {
        return match (true) {
            $user->isLawyer() => VendorType::LAWYER,
            $user->isExpert() => VendorType::EXPERT,
            $user->isJudge() => VendorType::JUDGE,
            default => null,
        };
    }

    private function targetRole(?string $role): ?string
    {
        $role = MigrateHelper::mapRole($role);

        return in_array($role, [
            'lawyer_bonyad',
            'lawyer_judicial',
            'judge',
            'official_expert',
            'legal_expert',
            'senior_legal_expert',
            'legal_doctorate',
            'lawyer_trainee',
        ], true) ? $role : null;
    }

    private function applicationStatus(?string $status): ?string
    {
        return match (strtolower(trim($status ?? ''))) {
            'draft' => 'draft',
            'pending', 'review', 'waiting', '' => 'pending',
            'accepted', 'accept', 'approved', 'approve' => 'accepted',
            'rejected', 'reject', 'declined', 'deny', 'denied' => 'rejected',
            default => null,
        };
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
     * @return array<string, array{enabled: bool, price: mixed, settings: ?array}>
     */
    private function services(object $vendor): array
    {
        return [
            VendorServiceType::CALL->value => [
                'enabled' => (bool) $vendor->call_active,
                'price' => null,
                'settings' => [
                    'prices' => [
                        10 => $vendor->phone_counseling_10,
                        20 => $vendor->phone_counseling_20,
                        30 => $vendor->phone_counseling_30,
                        40 => $vendor->phone_counseling_40,
                    ],
                ],
            ],
            VendorServiceType::DOCUMENT->value => [
                'enabled' => (bool) $vendor->docs_active,
                'price' => null,
                'settings' => [
                    'prices' => [
                        'bill' => $vendor->doc_bill,
                        'petition' => $vendor->doc_petition,
                        'statement' => $vendor->doc_statement,
                        'complaint' => $vendor->doc_complaint,
                        'contract' => $vendor->doc_contract,
                    ],
                    'offer' => $vendor->doc_offer,
                ],
            ],
            VendorServiceType::CASE->value => [
                'enabled' => (bool) $vendor->case_active,
                'price' => $vendor->case_price,
                'settings' => ['offer' => $vendor->case_offer],
            ],
            VendorServiceType::SUBSCRIPTION->value => [
                'enabled' => (bool) $vendor->dadcoin_active,
                'price' => $vendor->dadcoin_price,
                'settings' => null,
            ],
        ];
    }
}
