<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();
            $table->string('channel', 10);
            $table->string('recipient');
            $table->jsonb('payload');
            $table->string('status', 10)->default('pending');
            $table->timestampTz('sent_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index('user_id', 'idx_notifications_user');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_channel_check CHECK (channel IN ('sms', 'push', 'telegram', 'eitaa', 'bale', 'call'))");
            DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_status_check CHECK (status IN ('pending', 'sent', 'failed'))");
            DB::statement("CREATE INDEX idx_notifications_status ON notifications(status) WHERE status = 'pending'");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
