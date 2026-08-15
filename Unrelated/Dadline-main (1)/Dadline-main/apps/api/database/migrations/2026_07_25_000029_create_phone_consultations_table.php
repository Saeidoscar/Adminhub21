<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phone_consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('vendor_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('category_id')
                ->constrained('legal_categories')
                ->cascadeOnDelete();
            $table->text('text')->nullable();
            $table->string('vendor_role', 10);
            $table->unsignedInteger('minutes');
            $table->unsignedBigInteger('price');
            $table->string('status', 10)->default('submitted');
            $table->timestampTz('expires_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index('user_id', 'idx_phone_consultations_user');
            $table->index('vendor_id');
            $table->index('category_id');
            $table->index('status');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE phone_consultations ADD CONSTRAINT phone_consultations_vendor_role_check CHECK (vendor_role IN ('expert', 'lawyer', 'vip'))");
            DB::statement("ALTER TABLE phone_consultations ADD CONSTRAINT phone_consultations_status_check CHECK (status IN ('submitted', 'calling', 'answered', 'canceled'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('phone_consultations');
    }
};
