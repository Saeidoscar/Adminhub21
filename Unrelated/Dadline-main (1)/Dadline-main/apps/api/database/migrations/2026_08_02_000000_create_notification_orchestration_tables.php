<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 100);
            $table->string('channel', 16);
            $table->string('title')->nullable();
            $table->text('body');
            $table->jsonb('variables')->nullable();
            $table->jsonb('provider_patterns')->nullable();
            $table->string('category', 30)->default('system');
            $table->string('priority', 12)->default('normal');
            $table->boolean('is_critical')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('quiet_hours_enabled')->default(true);
            $table->unsignedSmallInteger('dedupe_window_minutes')->default(0);
            $table->unsignedSmallInteger('retention_days')->nullable();
            $table->timestampsTz();

            $table->unique(['key', 'channel']);
            $table->index(['key', 'is_active']);
            $table->index(['channel', 'is_active']);
        });

        Schema::table('notifications', function (Blueprint $table): void {
            $table->string('template_key', 100)->nullable()->after('user_id');
            $table->string('event_key', 100)->nullable()->after('template_key');
            $table->string('title')->nullable()->after('recipient');
            $table->text('body')->nullable()->after('title');
            $table->string('category', 30)->default('system')->after('payload');
            $table->string('priority', 12)->default('normal')->after('category');
            $table->boolean('is_critical')->default(false)->after('priority');
            $table->string('dedupe_key', 160)->nullable()->after('is_critical');
            $table->jsonb('metadata')->nullable()->after('dedupe_key');
            $table->timestampTz('expires_at')->nullable()->after('metadata');

            $table->unique('dedupe_key');
            $table->index(['template_key', 'created_at']);
            $table->index(['event_key', 'created_at']);
            $table->index(['category', 'created_at']);
        });

        Schema::table('notification_preferences', function (Blueprint $table): void {
            $table->boolean('email_enabled')->default(true)->after('push_enabled');
            $table->jsonb('channel_preferences')->nullable()->after('bale_enabled');
            $table->time('quiet_hours_start')->nullable()->after('channel_preferences');
            $table->time('quiet_hours_end')->nullable()->after('quiet_hours_start');
            $table->string('timezone', 64)->default('Asia/Tehran')->after('quiet_hours_end');
        });

        Schema::create('notification_deliveries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('notification_id')
                ->constrained('notifications')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('channel', 16);
            $table->string('recipient')->nullable();
            $table->string('provider', 50)->nullable();
            $table->string('provider_message_id', 150)->nullable();
            $table->string('title')->nullable();
            $table->text('body')->nullable();
            $table->jsonb('payload')->nullable();
            $table->jsonb('provider_payload')->nullable();
            $table->string('status', 12)->default('pending');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->unsignedTinyInteger('max_attempts')->default(3);
            $table->unsignedSmallInteger('sms_units')->default(0);
            $table->string('error_code', 80)->nullable();
            $table->text('error_message')->nullable();
            $table->timestampTz('next_retry_at')->nullable();
            $table->timestampTz('sent_at')->nullable();
            $table->timestampTz('failed_at')->nullable();
            $table->timestampsTz();

            $table->index(['notification_id', 'channel']);
            $table->index(['user_id', 'created_at']);
            $table->index(['channel', 'status', 'created_at']);
            $table->index(['status', 'next_retry_at']);
            $table->index('recipient');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_channel_check');
            DB::statement('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_status_check');
            DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_channel_check CHECK (channel IN ('database', 'sms', 'push', 'telegram', 'eitaa', 'bale', 'call', 'email'))");
            DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_status_check CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))");
            DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_priority_check CHECK (priority IN ('low', 'normal', 'high', 'critical'))");
            DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_category_check CHECK (category IN ('auth', 'contract', 'payment', 'security', 'legal_deadline', 'system', 'marketing'))");

            DB::statement("ALTER TABLE notification_templates ADD CONSTRAINT notification_templates_channel_check CHECK (channel IN ('database', 'sms', 'push', 'telegram', 'eitaa', 'bale', 'call', 'email'))");
            DB::statement("ALTER TABLE notification_templates ADD CONSTRAINT notification_templates_priority_check CHECK (priority IN ('low', 'normal', 'high', 'critical'))");
            DB::statement("ALTER TABLE notification_templates ADD CONSTRAINT notification_templates_category_check CHECK (category IN ('auth', 'contract', 'payment', 'security', 'legal_deadline', 'system', 'marketing'))");

            DB::statement("ALTER TABLE notification_deliveries ADD CONSTRAINT notification_deliveries_channel_check CHECK (channel IN ('database', 'sms', 'push', 'telegram', 'eitaa', 'bale', 'call', 'email'))");
            DB::statement("ALTER TABLE notification_deliveries ADD CONSTRAINT notification_deliveries_status_check CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'retrying', 'cancelled'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_deliveries');

        Schema::table('notification_preferences', function (Blueprint $table): void {
            $table->dropColumn([
                'email_enabled',
                'channel_preferences',
                'quiet_hours_start',
                'quiet_hours_end',
                'timezone',
            ]);
        });

        Schema::table('notifications', function (Blueprint $table): void {
            $table->dropUnique(['dedupe_key']);
            $table->dropIndex(['template_key', 'created_at']);
            $table->dropIndex(['event_key', 'created_at']);
            $table->dropIndex(['category', 'created_at']);
            $table->dropColumn([
                'template_key',
                'event_key',
                'title',
                'body',
                'category',
                'priority',
                'is_critical',
                'dedupe_key',
                'metadata',
                'expires_at',
            ]);
        });

        Schema::dropIfExists('notification_templates');

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_channel_check');
            DB::statement('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_status_check');
            DB::statement('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_priority_check');
            DB::statement('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_category_check');
            DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_channel_check CHECK (channel IN ('sms', 'push', 'telegram', 'eitaa', 'bale', 'call'))");
            DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_status_check CHECK (status IN ('pending', 'sent', 'failed'))");
        }
    }
};
