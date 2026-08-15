<?php

namespace App\Console\Commands;

use App\Models\Attachment;
use App\Models\BotLink;
use App\Models\City;
use App\Models\GiftCard;
use App\Models\GiftCardRedemption;
use App\Models\LegalCategory;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\PlatformAlert;
use App\Models\ShortLink;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserSubscription;
use App\Models\UserVerification;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MigratePart1
{
    public function __construct(
        private Command $console
    ) {}

    public function migrateUsers(bool $dryRun): void
    {
        $this->console->info('در حال انتقال کاربران ...');
        $query = MigrateHelper::legacy('ad_users');
        $bar = $this->console->getOutput()->createProgressBar($query->count());

        $skipped = 0;

        $query->orderBy('ID')->chunkById(500, function ($rows) use ($dryRun, $bar, &$skipped): void {
            foreach ($rows as $row) {
                $mobile = trim($row->user_login);

                if (! preg_match('/^[0-9]{10,11}$/', $mobile)) {
                    $skipped++;
                    $this->console->warn("Invalid mobile skipped: {$mobile} (id: {$row->ID})");
                    $bar->advance();

                    continue;
                }

                if (User::where('id', $row->ID)->exists()) {
                    $skipped++;
                    $bar->advance();

                    continue;
                }

                if (User::where('mobile', $mobile)->exists()) {
                    $skipped++;
                    $this->console->warn("Duplicate mobile skipped: {$mobile} (id: {$row->ID})");
                    $bar->advance();

                    continue;
                }

                if (! $dryRun) {
                    DB::table('users')->insert([
                        'id' => $row->ID,
                        'mobile' => $mobile,
                        'password' => filled($row->user_pass) ? trim($row->user_pass) : null,
                        'created_at' => $row->user_registered,
                        'registered_at' => $row->user_registered,
                        'updated_at' => now(),
                    ]);
                }
                $bar->advance();
            }
        }, 'ID', 'ID');

        $bar->finish();

        $this->console->newLine();

        $this->console->info("کاربران تکراری رد شده: {$skipped}");
    }

    public function migrateAttachments(bool $dryRun): void
    {
        $this->console->info('در حال انتقال فایل‌ها از ad_dad_files...');

        $query = MigrateHelper::legacy('ad_dad_files');
        $bar = $this->console->getOutput()->createProgressBar($query->count());

        $created = 0;
        $skipped = 0;
        $missingUsers = 0;

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            &$created,
            &$skipped,
            &$missingUsers
        ): void {
            foreach ($rows as $row) {

                if (Attachment::where('id', $row->id)->exists()) {
                    $skipped++;
                    $bar->advance();

                    continue;
                }

                if (! User::whereKey($row->user_id)->exists()) {
                    $missingUsers++;

                    $this->console->info('Attachment migration skipped because user does not exist.');

                    $bar->advance();

                    continue;
                }

                if (! $dryRun) {
                    Attachment::create([
                        'id' => $row->id,
                        'user_id' => $row->user_id,
                        'storage_key' => $row->path,
                        'original_name' => basename($row->path),
                        'mime_type' => MigrateHelper::guessMimeType($row->path),
                        'is_private' => (bool) $row->private,
                        'created_at' => now(),
                    ]);
                }

                $created++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();

        $this->console->info("فایل‌های منتقل‌شده: {$created}");
        $this->console->info("رد شده (تکراری): {$skipped}");
        $this->console->warn("رد شده به علت نبودن کاربر: {$missingUsers}");
    }

    public function migrateNamesFromUserMeta(bool $dryRun): void
    {
        $this->console->info('در حال انتقال first_name/last_name از ad_usermeta...');

        $firstNames = migratehelper::legacy('ad_usermeta')
            ->where('meta_key', 'first_name')
            ->pluck('meta_value', 'user_id');

        $lastNames = migratehelper::legacy('ad_usermeta')
            ->where('meta_key', 'last_name')
            ->pluck('meta_value', 'user_id');

        $displayNames = migratehelper::legacy('ad_users')
            ->pluck('display_name', 'ID');

        $bar = $this->console->getoutput()->createProgressBar($displayNames->count());
        $updated = 0;

        foreach ($displayNames as $userId => $displayName) {

            $firstName = trim($firstNames->get($userId, ''));
            $lastName = trim($lastNames->get($userId, ''));

            $update = [];

            if (filled($firstName)) {
                $update['first_name'] = $firstName;
            } elseif (filled($displayName)) {
                $update['first_name'] = $displayName;
            }

            if (filled($lastName)) {
                $update['last_name'] = $lastName;
            }

            if (! empty($update) && ! $dryRun) {
                User::where('id', $userId)->update($update);
            }

            if (! empty($update)) {
                $updated++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->console->newLine();
        $this->console->info("تعداد کاربران به‌روزرسانی‌شده: {$updated}");
    }

    public function migrateExpertiseFromUserMeta(bool $dryRun): void
    {
        $this->console->info('migrate expertise from ad_dad_usermeta ...');

        $expertises = migratehelper::legacy('ad_dad_usermeta')
            ->whereNotNull('expertise')
            ->pluck('expertise', 'user_id');

        $bar = $this->console->getOutput()->createProgressBar($expertises->count());

        $updated = 0;

        foreach ($expertises as $userId => $expertise) {

            if (empty(trim($expertise))) {
                $bar->advance();

                continue;
            }

            $slugs = collect(explode(',', $expertise))
                ->map(fn ($item) => trim($item))
                ->filter();

            $categoryIds = LegalCategory::whereIn('slug', $slugs)
                ->pluck('id');

            if ($categoryIds->isEmpty()) {
                $bar->advance();

                continue;
            }

            if (! $dryRun) {

                $user = User::find($userId);

                if ($user) {
                    $user->legalCategories()->syncWithoutDetaching($categoryIds);
                    $updated++;
                }
            }

            $bar->advance();
        }

        $bar->finish();
        $this->console->newLine();

        $this->console->info(
            "تعداد کاربران دارای تخصص منتقل‌شده: {$updated}"
        );
    }

    public function migrateProfileFromDadUserMeta(bool $dryRun): void
    {
        $this->console->info('در حال merge کردن ad_dad_usermeta با users...');

        $query = MigrateHelper::legacy('ad_dad_usermeta');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $updated = 0;

        $query->orderBy('user_id')->chunkById(500, function ($rows) use ($dryRun, $bar, &$updated): void {
            $existingUserIds = User::whereIn('id', $rows->pluck('user_id'))
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if (! $existingUserIds->has($row->user_id)) {
                    $bar->advance();

                    continue;
                }

                if (! $dryRun) {

                    User::where('id', $row->user_id)->update([
                        'is_vendor' => (bool) $row->is_vendor,
                        'role' => MigrateHelper::mapRole($row->role),
                        'last_login_at' => $row->last_login,
                    ]);

                    // فقط اگر حداقل یک مقدار پروفایل داریم بساز
                    $profileData = array_filter([
                        'national_id' => $row->national_id,
                        'birth_date' => $row->birth_date,
                        'iban' => $row->iban,
                        'city_id' => $row->city_id,
                        'referrer_id' => $row->ref_id,
                        'signature_id' => is_numeric($row->signature_pic)
                            ? (int) $row->signature_pic
                            : null,
                    ], fn ($value) => ! is_null($value));

                    if (! empty($profileData)) {
                        UserProfile::updateOrCreate(
                            ['user_id' => $row->user_id],
                            $profileData
                        );
                    }

                    // فقط اگر verify مقدار دارد، verification بساز
                    $verifiedData = match ((int) $row->verify) {

                        1 => [
                            'verified_level' => 1,
                            'mobile_verified' => true,
                            'national_verified' => false,
                        ],

                        2 => [
                            'verified_level' => 2,
                            'mobile_verified' => true,
                            'national_verified' => true,
                        ],

                        default => null,
                    };

                    if ($verifiedData !== null) {
                        UserVerification::updateOrCreate(
                            ['user_id' => $row->user_id],
                            $verifiedData
                        );
                    }
                }

                $updated++;
                $bar->advance();
            }
        }, 'user_id');

        $bar->finish();
        $this->console->newLine();

        $this->console->info("profile count merged: {$updated}");
    }

    public function migrateAvatars(bool $dryRun): void
    {
        $this->console->info('در حال انتقال avatar از ad_dad_user_avatars...');

        $avatars = migratehelper::legacy('ad_dad_user_avatars')
            ->whereNotNull('user_id')
            ->whereNotNull('og')
            ->pluck('og', 'user_id');

        $bar = $this->console->getoutput()->createProgressBar($avatars->count());
        $updated = 0;
        $skipped = 0;

        foreach ($avatars as $userId => $avatar) {

            if (blank($avatar)) {
                $skipped++;
                $bar->advance();

                continue;
            }

            if (! $dryRun) {

                $profile = UserProfile::where('user_id', $userId)->first();

                if (! $profile) {
                    $skipped++;
                    $bar->advance();

                    continue;
                }

                $profile->update([
                    'avatar_id' => $avatar,
                ]);
            }

            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->console->newLine();

        $this->console->info("آواتارهای به‌روزرسانی‌شده: {$updated}");
        $this->console->info("رد شده: {$skipped}");
    }

    public function migrateShortLinks(bool $dryRun): void
    {
        $this->console->info('ad_dad_shorten_link to short_links...');

        $query = MigrateHelper::legacy('ad_dad_shorten_link');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $created = 0;
        $skipped = 0;

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            &$created,
            &$skipped
        ): void {
            foreach ($rows as $row) {
                $path = $this->shortLinkPath($row->original_url);
                $existing = ShortLink::query()
                    ->whereKey($row->id)
                    ->orWhere('short_code', $row->short_code)
                    ->first();

                if ($existing !== null) {
                    if (! $dryRun && $existing->original_url !== $path) {
                        $existing->update(['original_url' => $path]);
                    }

                    $skipped++;
                    $bar->advance();

                    continue;
                }

                if (! $dryRun) {
                    ShortLink::query()->create([
                        'id' => $row->id,
                        'short_code' => $row->short_code,
                        'original_url' => $path,
                        'clicks' => max((int) ($row->clicks ?? 0), 0),
                        'created_at' => $row->created_at,
                    ]);
                }

                $created++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("شورت‌لینک‌های جدید: {$created}");
        $this->console->info("رد شده (قبلاً موجود بود): {$skipped}");
    }

    private function shortLinkPath(string $originalUrl): string
    {
        $path = preg_replace(
            '#^https?://(?:www\.)?dadline\.net(?=/|$)#i',
            '',
            $originalUrl
        );

        return $path === '' ? '/' : $path;
    }

    public function migrateNotificationPreferences(bool $dryRun): void
    {
        $this->console->info('ad_dad_notifmeta to notification_preferences...');

        $query = MigrateHelper::legacy('ad_dad_notifmeta');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$missingUsers,
            &$invalidRows
        ): void {
            $users = User::whereIn('id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if (! $users->has($row->user_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                if ((int) $row->sms_balance < 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $data = [
                    'sms_enabled' => (bool) $row->smsactive,
                    'bot_enabled' => (bool) $row->botactive,
                    'push_enabled' => (bool) $row->pushactive,
                    'eitaa_enabled' => (bool) $row->eitaaActive,
                    'bale_enabled' => (bool) $row->baleActive,
                    'sms_balance' => $row->sms_balance,
                ];

                if ($dryRun) {
                    $this->console->line("Notification preferences => user {$row->user_id}");
                } else {
                    NotificationPreference::updateOrCreate(
                        ['user_id' => $row->user_id],
                        $data
                    );
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Notification preferences migrated: {$migrated}.");
        $this->console->warn("Notification preferences skipped because the user was missing: {$missingUsers}.");
        $this->console->warn("Notification preferences skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateBotLinks(bool $dryRun): void
    {
        $this->console->info('ad_dadbot_users to bot_links...');

        $query = MigrateHelper::legacy('ad_dadbot_users');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $missingUsers = 0;

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$missingUsers
        ): void {
            $users = User::whereIn('id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if (! $users->has($row->user_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $data = [
                    'telegram_id' => $this->nullableLegacyId($row->chat_id),
                    'eitaa_id' => $this->nullableLegacyId($row->eitaa_id),
                    'bale_id' => $this->nullableLegacyId($row->bale_id),
                    'auth_token' => filled($row->auth_token) ? $row->auth_token : null,
                    'fcm_token' => null,
                ];

                if ($dryRun) {
                    $this->console->line("Bot link => user {$row->user_id}");
                } else {
                    $botLink = BotLink::updateOrCreate(
                        ['user_id' => $row->user_id],
                        $data
                    );
                    $botLink->created_at = $row->created_at ?? now();
                    $botLink->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Bot links migrated: {$migrated}.");
        $this->console->warn("Bot links skipped because the user was missing: {$missingUsers}.");
    }

    private function nullableLegacyId(mixed $value): ?int
    {
        if (blank($value) || (int) $value === 0) {
            return null;
        }

        return (int) $value;
    }

    public function migrateUserSubscriptions(bool $dryRun): void
    {
        $this->console->info('ad_dad_subscription to user_subscriptions...');

        $query = MigrateHelper::legacy('ad_dad_subscription');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$missingUsers,
            &$invalidRows
        ): void {
            $users = User::whereIn('id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if (! $users->has($row->user_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                if (! in_array($row->sub_type, ['freemium', 'premium'], true)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $data = [
                    'plan' => $row->sub_type,
                    'expires_at' => $row->expire_at,
                ];

                if ($dryRun) {
                    $this->console->line("User subscription => user {$row->user_id}");
                } else {
                    UserSubscription::updateOrCreate(
                        ['user_id' => $row->user_id],
                        $data
                    );
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("User subscriptions migrated: {$migrated}.");
        $this->console->warn("User subscriptions skipped because the user was missing: {$missingUsers}.");
        $this->console->warn("User subscriptions skipped because their data was invalid: {$invalidRows}.");
    }

    public function migratePlatformAlerts(bool $dryRun): void
    {
        $this->console->info('ad_dad_alerts to platform_alerts...');

        $query = MigrateHelper::legacy('ad_dad_alerts');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$invalidRows
        ): void {
            $existingIds = PlatformAlert::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (blank($row->msg) || ! in_array($row->status, ['draft', 'active'], true)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Platform alert {$row->id}");
                } else {
                    $alert = new PlatformAlert;
                    $alert->id = $row->id;
                    $alert->fill([
                        'message' => $row->msg,
                        'target_role' => filled($row->role) ? $row->role : 'all',
                        'alert_type' => filled($row->type) ? $row->type : 'primary',
                        'button_text' => filled($row->btnText) ? $row->btnText : null,
                        'link' => filled($row->link) ? $row->link : null,
                        'tab' => filled($row->tab) ? $row->tab : null,
                        'status' => $row->status,
                        'expires_at' => $row->expired_at,
                    ]);
                    $alert->created_at = $row->created_at ?? now();
                    $alert->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Platform alerts migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Platform alerts skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateNotifications(bool $dryRun): void
    {
        $total = 0;

        $total += $this->migrateSmsNotifications($dryRun);
        $total += $this->migratePushNotifications($dryRun);
        $total += $this->migrateBotNotifications($dryRun, 'ad_dad_notif_telegram', 'telegram', 'telegram_id');
        $total += $this->migrateBotNotifications($dryRun, 'ad_dad_notif_eitaa', 'eitaa', 'eitaa_id');

        $this->console->info("Notification rows processed: {$total}.");
    }

    private function migrateSmsNotifications(bool $dryRun): int
    {
        return $this->migrateNotificationTable(
            $dryRun,
            'ad_dad_notif_sms',
            'sms',
            function ($rows): array {
                return User::whereIn('mobile', $rows->pluck('mobile')->filter()->unique())
                    ->pluck('id', 'mobile')
                    ->all();
            },
            fn (object $row, array $users): array => [
                'user_id' => $users[$row->mobile] ?? null,
                'recipient' => $row->mobile,
                'payload' => [
                    'args' => filled($row->args) ? explode(';', $row->args) : [],
                    'pattern' => $row->pattern,
                    'provider' => $row->provider,
                    'body_id' => $row->body_id,
                ],
            ],
        );
    }

    private function migratePushNotifications(bool $dryRun): int
    {
        return $this->migrateNotificationTable(
            $dryRun,
            'ad_dad_notif_push',
            'push',
            function ($rows): array {
                return User::whereIn('id', $rows->pluck('userid')->filter()->unique())
                    ->pluck('id')
                    ->flip()
                    ->all();
            },
            fn (object $row, array $users): array => [
                'user_id' => isset($users[$row->userid]) ? $row->userid : null,
                'recipient' => (string) $row->userid,
                'payload' => [
                    'title' => $row->title,
                    'body' => $row->body,
                    'link' => $row->link,
                    'img_url' => $row->img_url,
                ],
            ],
        );
    }

    private function migrateBotNotifications(
        bool $dryRun,
        string $legacyTable,
        string $channel,
        string $botLinkColumn
    ): int {
        return $this->migrateNotificationTable(
            $dryRun,
            $legacyTable,
            $channel,
            function ($rows) use ($botLinkColumn): array {
                return BotLink::whereIn($botLinkColumn, $rows->pluck('chatid')->filter()->unique())
                    ->pluck('user_id', $botLinkColumn)
                    ->all();
            },
            fn (object $row, array $users): array => [
                'user_id' => $users[(int) $row->chatid] ?? $users[(string) $row->chatid] ?? null,
                'recipient' => (string) $row->chatid,
                'payload' => [
                    'message' => $row->message,
                    'buttons' => $this->decodeLegacyJson($row->buttons),
                    'reply_msg_id' => $row->reply_msg_id,
                ],
            ],
        );
    }

    /**
     * @param  callable(Collection<int, object>): array  $userMap
     * @param  callable(object, array): array{user_id: ?int, recipient: string, payload: array}  $mapRow
     */
    private function migrateNotificationTable(
        bool $dryRun,
        string $legacyTable,
        string $channel,
        callable $userMap,
        callable $mapRow
    ): int {
        $this->console->info("{$legacyTable} to notifications ({$channel})...");

        $query = MigrateHelper::legacy($legacyTable);
        $count = $query->count();
        $bar = $this->console->getOutput()->createProgressBar($count);
        $migrated = 0;
        $existing = Notification::where('channel', $channel)->count();
        $invalidRows = 0;
        $unmatchedUsers = 0;

        if ($existing > 0) {
            $bar->advance($count);
            $bar->finish();
            $this->console->newLine();
            $this->console->info("Notifications {$channel} migrated: 0; already existed: {$existing}.");
            $this->console->warn("Notifications {$channel} skipped because the channel already has imported rows.");

            return $existing;
        }

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            $channel,
            $userMap,
            $mapRow,
            &$migrated,
            &$invalidRows,
            &$unmatchedUsers
        ): void {
            $users = $userMap($rows);
            $inserts = [];

            foreach ($rows as $row) {
                $status = $this->notificationStatus($row->status);
                $mapped = $mapRow($row, $users);

                if ($status === null || blank($mapped['recipient'])) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if ($mapped['user_id'] === null) {
                    $unmatchedUsers++;
                }

                if (! $dryRun) {
                    $inserts[] = [
                        'user_id' => $mapped['user_id'],
                        'channel' => $channel,
                        'recipient' => $mapped['recipient'],
                        'payload' => json_encode($mapped['payload'], JSON_THROW_ON_ERROR),
                        'status' => $status,
                        'sent_at' => $status === 'sent' ? ($row->updated_at ?? $row->created_at) : null,
                        'created_at' => $row->created_at ?? now(),
                    ];
                }

                $migrated++;
                $bar->advance();
            }

            if ($inserts !== []) {
                DB::table('notifications')->insert($inserts);
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Notifications {$channel} migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Notifications {$channel} with unmatched user: {$unmatchedUsers}.");
        $this->console->warn("Notifications {$channel} skipped because their data was invalid: {$invalidRows}.");

        return $migrated + $existing + $invalidRows;
    }

    private function notificationStatus(?string $status): ?string
    {
        return match ($status) {
            'sent' => 'sent',
            'failed' => 'failed',
            'pending', null, '' => 'pending',
            default => null,
        };
    }

    private function decodeLegacyJson(?string $value): mixed
    {
        if (blank($value)) {
            return null;
        }

        try {
            return json_decode($value, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return $value;
        }
    }

    public function migrateTickets(bool $dryRun): void
    {
        $this->console->info('ad_dad_tickets to tickets...');

        $query = MigrateHelper::legacy('ad_dad_tickets');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$invalidRows
        ): void {
            $existingIds = Ticket::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $userIds = $rows->pluck('sender_id')
                ->merge($rows->pluck('ref_id'))
                ->filter()
                ->unique();
            $users = User::whereIn('id', $userIds)->pluck('id')->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->sender_id) || ($row->ref_id !== null && ! $users->has($row->ref_id))) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $status = $this->ticketStatus($row->status);

                if ($status === null) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $title = filled($row->title) ? $row->title : "Legacy ticket {$row->id}";

                if (! $dryRun) {
                    $ticket = new Ticket;
                    $ticket->id = $row->id;
                    $ticket->fill([
                        'uuid' => (string) Str::uuid(),
                        'sender_id' => $row->sender_id,
                        'title' => $title,
                        'provider_id' => $row->ref_id,
                        'status' => $status,
                    ]);
                    $ticket->created_at = $row->created_at ?? now();
                    $ticket->updated_at = $row->updated_at ?? $ticket->created_at;
                    $ticket->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Tickets migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Tickets skipped because a user was missing: {$missingUsers}.");
        $this->console->warn("Tickets skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateTicketMessages(bool $dryRun): void
    {
        $this->console->info('ad_dad_ticket_msg to ticket_messages...');

        $query = MigrateHelper::legacy('ad_dad_ticket_msg');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingReferences = 0;
        $missingFiles = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingReferences,
            &$missingFiles,
            &$invalidRows
        ): void {
            $existingIds = TicketMessage::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $tickets = Ticket::whereIn('id', $rows->pluck('ticket_id')->filter()->unique())
                ->pluck('id')
                ->flip();
            $users = User::whereIn('id', $rows->pluck('user_id')->filter()->unique())
                ->pluck('id')
                ->flip();
            $files = $rows->pluck('file')->filter(fn ($file) => filled($file))->values();
            $numericFileIds = $files
                ->filter(fn ($file) => ctype_digit((string) $file))
                ->map(fn ($file) => (int) $file)
                ->unique();
            $attachmentIds = Attachment::whereIn('id', $numericFileIds)
                ->pluck('id')
                ->flip();
            $fileStorageKeys = $files
                ->reject(fn ($file) => ctype_digit((string) $file))
                ->flatMap(fn ($file) => $this->ticketFileStorageKeyCandidates((string) $file))
                ->unique()
                ->values();
            $attachmentsByStorageKey = Attachment::whereIn('storage_key', $fileStorageKeys)
                ->pluck('id', 'storage_key');

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $tickets->has($row->ticket_id) || ! $users->has($row->user_id)) {
                    $missingReferences++;
                    $bar->advance();

                    continue;
                }

                if (blank($row->msg)) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $fileId = $this->ticketAttachmentId($row->file, $attachmentIds, $attachmentsByStorageKey);

                if (filled($row->file) && $fileId === null) {
                    $missingFiles++;
                }

                if (! $dryRun) {
                    $message = new TicketMessage;
                    $message->id = $row->id;
                    $message->fill([
                        'ticket_id' => $row->ticket_id,
                        'user_id' => $row->user_id,
                        'from_admin' => (bool) $row->from_admin,
                        'body' => $row->msg,
                        'file_id' => $fileId,
                    ]);
                    $message->created_at = $row->created_at ?? now();
                    $message->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Ticket messages migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Ticket messages skipped because a ticket or user was missing: {$missingReferences}.");
        $this->console->warn("Ticket message files not found in attachments: {$missingFiles}.");
        $this->console->warn("Ticket messages skipped because their data was invalid: {$invalidRows}.");
    }

    private function ticketAttachmentId(mixed $file, Collection $attachmentIds, Collection $attachmentsByStorageKey): ?int
    {
        if (blank($file)) {
            return null;
        }

        if (ctype_digit((string) $file)) {
            $fileId = (int) $file;

            return $attachmentIds->has($fileId) ? $fileId : null;
        }

        foreach ($this->ticketFileStorageKeyCandidates((string) $file) as $storageKey) {
            $attachmentId = $attachmentsByStorageKey->get($storageKey);

            if ($attachmentId !== null) {
                return (int) $attachmentId;
            }
        }

        return null;
    }

    private function ticketFileStorageKeyCandidates(string $file): array
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

    private function ticketStatus(?string $status): ?string
    {
        return match ($status) {
            'open' => 'open',
            'answered' => 'answered',
            'referred', 'reffered' => 'referred',
            'pending' => 'pending',
            'closed' => 'closed',
            default => null,
        };
    }

    public function migrateGiftCards(bool $dryRun): void
    {
        $this->console->info('ad_dad_gift_card to gift_cards...');

        $query = MigrateHelper::legacy('ad_dad_gift_card');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$invalidRows
        ): void {
            $existingIds = GiftCard::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $existingCodes = GiftCard::whereIn('code', $rows->pluck('code')->filter()->unique())
                ->pluck('code')
                ->flip();
            $users = User::whereIn('id', $rows->pluck('creator_id')->filter()->unique())
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if ($existingIds->has($row->id) || $existingCodes->has($row->code)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->creator_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                if (blank($row->code) || (int) $row->amount < 0 || (int) $row->limit < 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                if (! $dryRun) {
                    $giftCard = new GiftCard;
                    $giftCard->id = $row->id;
                    $giftCard->fill([
                        'user_id' => $row->creator_id,
                        'code' => $row->code,
                        'amount' => $row->amount,
                        'redemption_limit' => $row->limit ?? 1,
                        'expires_at' => $row->expire,
                    ]);
                    $giftCard->created_at = $row->created_at ?? now();
                    $giftCard->save();
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Gift cards migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Gift cards skipped because the creator user was missing: {$missingUsers}.");
        $this->console->warn("Gift cards skipped because their data was invalid: {$invalidRows}.");
    }

    public function migrateGiftCardRedemptions(bool $dryRun): void
    {
        $this->console->info('ad_dad_gift_card.used_id to gift_card_redemptions...');

        $query = MigrateHelper::legacy('ad_dad_gift_card');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingReferences = 0;
        $invalidRows = 0;

        $query->orderBy('id')->chunkById(500, function ($rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingReferences,
            &$invalidRows
        ): void {
            $giftCards = GiftCard::whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $userIds = $rows
                ->flatMap(fn ($row) => $this->giftCardUsedUserIds($row->used_id))
                ->unique()
                ->values();
            $users = User::whereIn('id', $userIds)
                ->pluck('id')
                ->flip();

            foreach ($rows as $row) {
                if (! $giftCards->has($row->id)) {
                    $missingReferences += count($this->giftCardUsedUserIds($row->used_id));
                    $bar->advance();

                    continue;
                }

                foreach ($this->giftCardUsedUserIds($row->used_id) as $userId) {
                    if (! $users->has($userId)) {
                        $missingReferences++;

                        continue;
                    }

                    if (GiftCardRedemption::where('gift_card_id', $row->id)->where('user_id', $userId)->exists()) {
                        $existing++;

                        continue;
                    }

                    if (! $dryRun) {
                        GiftCardRedemption::create([
                            'gift_card_id' => $row->id,
                            'user_id' => $userId,
                            'redeemed_at' => $row->created_at ?? now(),
                        ]);
                    }

                    $migrated++;
                }

                if (filled($row->used_id) && $this->giftCardUsedUserIds($row->used_id) === []) {
                    $invalidRows++;
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Gift card redemptions migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Gift card redemptions skipped because a gift card or user was missing: {$missingReferences}.");
        $this->console->warn("Gift card redemptions skipped because their data was invalid: {$invalidRows}.");
    }

    /**
     * @return list<int>
     */
    private function giftCardUsedUserIds(?string $usedIds): array
    {
        if (blank($usedIds)) {
            return [];
        }

        return collect(preg_split('/\s*,\s*/', $usedIds, -1, PREG_SPLIT_NO_EMPTY))
            ->filter(fn ($userId) => ctype_digit($userId))
            ->map(fn ($userId) => (int) $userId)
            ->unique()
            ->values()
            ->all();
    }

    public function migrateCities(bool $dryRun): void
    {
        $this->console->info('در حال انتقال ad_dad_cities به cities...');

        $query = MigrateHelper::legacy('ad_dad_cities');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $legacyToNewId = [];

        foreach ($query->orderBy('id')->cursor() as $row) {
            $existing = City::where('id', $row->id)->first();

            if ($existing) {
                $legacyToNewId[$row->id] = $existing->id;
                $bar->advance();

                continue;
            }

            $slug = $row->slug ?: str($row->name)->slug()->toString();
            $slugOwner = City::where('slug', $slug)->first();

            if ($slugOwner) {
                $legacyToNewId[$row->id] = $slugOwner->id;
                $bar->advance();

                continue;
            }

            if (! $dryRun) {
                $city = City::create([
                    'parent_id' => null,
                    'name' => $row->name,
                    'slug' => $slug,
                    'id' => $row->id,
                ]);
                $legacyToNewId[$row->id] = $city->id;
            } else {
                $legacyToNewId[$row->id] = $row->id;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->console->newLine();

        if (! $dryRun) {
            $this->console->info('در حال تنظیم روابط parent...');

            foreach (MigrateHelper::legacy('ad_dad_cities')->orderBy('id')->cursor() as $row) {
                if ($row->parent && isset($legacyToNewId[$row->parent])) {
                    City::where('id', $row->id)
                        ->update(['parent_id' => $legacyToNewId[$row->parent]]);
                }
            }

            $this->console->info('در حال اصلاح city_id/province_id در users...');

            foreach ($legacyToNewId as $legacyId => $newId) {
                UserProfile::where('city_id', $legacyId)->update(['city_id' => $newId]);
            }
        }

        $this->console->info('انتقال شهرها به پایان رسید. تعداد: '.count($legacyToNewId));
    }
}
