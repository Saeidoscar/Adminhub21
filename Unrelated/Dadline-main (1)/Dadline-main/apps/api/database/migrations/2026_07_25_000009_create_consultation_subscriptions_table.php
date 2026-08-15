<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('vendor_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->unsignedInteger('purchased')->default(0);
            $table->unsignedInteger('used')->default(0);
            $table->boolean('is_read')->default(false);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->unique(['client_id', 'vendor_id']);
            $table->index('client_id', 'idx_consultation_subscriptions_client');
            $table->index('vendor_id', 'idx_consultation_subscriptions_vendor');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE consultation_subscriptions ADD CONSTRAINT consultation_subscriptions_purchased_check CHECK (purchased >= 0)');
            DB::statement('ALTER TABLE consultation_subscriptions ADD CONSTRAINT consultation_subscriptions_used_check CHECK (used >= 0 AND used <= purchased)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_subscriptions');
    }
};
