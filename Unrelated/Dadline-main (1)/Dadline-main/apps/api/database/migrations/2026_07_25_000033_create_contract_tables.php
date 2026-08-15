<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('creator_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('status', 12)->default('draft');
            $table->string('tracking_code', 30)->nullable()->unique();
            $table->string('pin_code', 4)->nullable();
            $table->foreignId('qr_id')
                ->nullable()
                ->constrained('attachments')
                ->restrictOnDelete();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['creator_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('signatures', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contract_id')
                ->constrained('contracts')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('full_name')->nullable();
            $table->string('mobile', 11)->nullable();
            $table->string('verification_code', 6)->nullable();
            $table->timestampTz('code_expires_at')->nullable();
            $table->string('signature_status', 10)->default('pending');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->foreignId('signature_id')
                ->nullable()
                ->constrained('attachments')
                ->restrictOnDelete();
            $table->timestampTz('signed_at')->nullable();
            $table->timestampsTz();

            $table->index(['contract_id', 'mobile']);
            $table->index('user_id');
            $table->index('mobile');
            $table->index(['contract_id', 'signature_status']);
            $table->index('code_expires_at');
        });

        Schema::create('contract_ai_analyses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contract_id')
                ->unique()
                ->constrained('contracts')
                ->cascadeOnDelete();
            $table->jsonb('ai_data');
            $table->text('ai_content')->nullable();
            $table->timestampsTz();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE contracts ADD CONSTRAINT contracts_status_check CHECK (status IN ('draft', 'active', 'completed', 'expired', 'cancelled'))");
            DB::statement("ALTER TABLE contracts ADD CONSTRAINT contracts_pin_code_check CHECK (pin_code IS NULL OR pin_code ~ '^[0-9]{4}$')");
            DB::statement("ALTER TABLE signatures ADD CONSTRAINT signatures_mobile_check CHECK (mobile IS NULL OR mobile ~ '^09[0-9]{9}$')");
            DB::statement("ALTER TABLE signatures ADD CONSTRAINT signatures_verification_code_check CHECK (verification_code IS NULL OR verification_code ~ '^[0-9]{6}$')");
            DB::statement("ALTER TABLE signatures ADD CONSTRAINT signatures_signature_status_check CHECK (signature_status IN ('pending', 'signed', 'removed'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_ai_analyses');
        Schema::dropIfExists('signatures');
        Schema::dropIfExists('contracts');
    }
};
