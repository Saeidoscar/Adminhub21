<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use App\Services\Settlements\PersianCalendar;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payout_settlements', function (Blueprint $table): void {
            $table->string('provider', 30)->nullable()->after('iban');
            $table->string('unique_code', 100)->nullable()->unique()->after('provider');
            $table->jsonb('provider_data')->default('{}')->after('track_id');
            $table->text('failure_reason')->nullable()->after('provider_data');
            $table->timestampTz('scheduled_for')->nullable()->after('failure_reason');
            $table->timestampTz('submitted_at')->nullable()->after('scheduled_for');
            $table->timestampTz('last_checked_at')->nullable()->after('submitted_at');

            $table->index(['provider', 'status']);
            $table->index(['status', 'scheduled_for']);
            $table->index(['status', 'last_checked_at']);
        });

        DB::table('payout_settlements')
            ->where('status', 'pending')
            ->whereNull('scheduled_for')
            ->update([
                'scheduled_for' => (new PersianCalendar)->payoutAt(now('Asia/Tehran')),
            ]);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE payout_settlements DROP CONSTRAINT IF EXISTS payout_settlements_status_check');
            DB::statement("ALTER TABLE payout_settlements ADD CONSTRAINT payout_settlements_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed'))");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE payout_settlements DROP CONSTRAINT IF EXISTS payout_settlements_status_check');
            DB::statement("ALTER TABLE payout_settlements ADD CONSTRAINT payout_settlements_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))");
        }

        Schema::table('payout_settlements', function (Blueprint $table): void {
            $table->dropIndex(['provider', 'status']);
            $table->dropIndex(['status', 'scheduled_for']);
            $table->dropIndex(['status', 'last_checked_at']);
            $table->dropUnique(['unique_code']);
            $table->dropColumn([
                'provider',
                'unique_code',
                'provider_data',
                'failure_reason',
                'scheduled_for',
                'submitted_at',
                'last_checked_at',
            ]);
        });
    }
};
