<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_subscriptions', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->primary()
                ->constrained()
                ->cascadeOnDelete();
            $table->string('plan', 10)->default('freemium');
            $table->timestampTz('expires_at')->nullable();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_plan_check CHECK (plan IN ('freemium', 'premium'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_subscriptions');
    }
};
