<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('office_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('office_id')
                ->constrained('offices')
                ->restrictOnDelete();
            $table->foreignId('case_id')
                ->nullable()
                ->constrained('office_cases')
                ->nullOnDelete();
            $table->foreignId('recorded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('correction_of_id')
                ->nullable()
                ->constrained('office_transactions')
                ->restrictOnDelete();
            $table->string('direction', 10);
            $table->string('related_party', 10)->nullable();
            $table->string('category')->nullable();
            $table->unsignedBigInteger('amount')->comment('Amount in toman');
            $table->text('description')->nullable();
            $table->timestampTz('transaction_at')->useCurrent();

            $table->index(['office_id', 'transaction_at']);
            $table->index(['office_id', 'direction', 'transaction_at']);
            $table->index(['case_id', 'transaction_at']);
            $table->index('recorded_by');
            $table->index('correction_of_id');
        });

        Schema::create('office_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('office_id')
                ->constrained('offices')
                ->cascadeOnDelete();
            $table->foreignId('case_id')
                ->nullable()
                ->constrained('office_cases')
                ->cascadeOnDelete();
            $table->foreignId('attachment_id')
                ->constrained('attachments')
                ->restrictOnDelete();
            $table->foreignId('uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('title')->nullable();
            $table->string('type', 100)->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['office_id', 'attachment_id']);
            $table->index('office_id');
            $table->index('case_id');
            $table->index('attachment_id');
            $table->index('uploaded_by');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE office_transactions ADD CONSTRAINT office_transactions_direction_check CHECK (direction IN ('income', 'expense'))");
            DB::statement("ALTER TABLE office_transactions ADD CONSTRAINT office_transactions_related_party_check CHECK (related_party IS NULL OR related_party IN ('client', 'lawyer', 'other'))");
            DB::statement('ALTER TABLE office_transactions ADD CONSTRAINT office_transactions_amount_check CHECK (amount > 0)');
            DB::statement('ALTER TABLE office_transactions ADD CONSTRAINT office_transactions_correction_check CHECK (correction_of_id IS NULL OR correction_of_id <> id)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('office_attachments');
        Schema::dropIfExists('office_transactions');
    }
};
