<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_alerts', function (Blueprint $table) {
            $table->id();
            $table->text('message');
            $table->string('target_role', 100)->default('all');
            $table->string('alert_type', 100)->default('primary');
            $table->string('button_text', 100)->nullable();
            $table->string('link', 200)->nullable();
            $table->string('tab', 100)->nullable();
            $table->string('status', 10)->default('draft');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('expires_at')->nullable();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE platform_alerts ADD CONSTRAINT platform_alerts_status_check CHECK (status IN ('draft', 'active'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_alerts');
    }
};
