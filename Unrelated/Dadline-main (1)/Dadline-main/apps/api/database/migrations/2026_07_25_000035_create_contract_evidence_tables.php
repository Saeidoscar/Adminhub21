<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_snapshots', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contract_id')
                ->unique()
                ->constrained('contracts')
                ->cascadeOnDelete();
            $table->string('body_hash', 128);
            $table->string('payload_hash', 128);
            $table->string('hash_algorithm', 20)->default('sha256');
            $table->jsonb('canonical_payload');
            $table->timestampsTz();

            $table->index('body_hash');
            $table->index('payload_hash');
        });

        Schema::create('contract_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contract_id')
                ->constrained('contracts')
                ->cascadeOnDelete();
            $table->foreignId('actor_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('event_type', 50);
            $table->jsonb('event_data')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestampTz('occurred_at');
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['contract_id', 'occurred_at']);
            $table->index(['event_type', 'occurred_at']);
            $table->index('actor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_events');

        Schema::dropIfExists('contract_snapshots');
    }
};
