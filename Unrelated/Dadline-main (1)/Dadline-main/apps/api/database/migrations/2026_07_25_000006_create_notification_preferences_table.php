<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->primary()
                ->constrained()
                ->cascadeOnDelete();
            $table->boolean('sms_enabled')->default(true);
            $table->boolean('bot_enabled')->default(true);
            $table->boolean('push_enabled')->default(true);
            $table->boolean('eitaa_enabled')->default(true);
            $table->boolean('bale_enabled')->default(true);
            $table->unsignedBigInteger('sms_balance')->default(50);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_sms_balance_check CHECK (sms_balance >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
