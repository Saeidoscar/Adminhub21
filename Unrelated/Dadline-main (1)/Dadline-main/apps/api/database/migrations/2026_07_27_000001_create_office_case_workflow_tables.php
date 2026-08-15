<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('office_case_notes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('case_id')
                ->constrained('office_cases')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('type', 55)->default('یادداشت');
            $table->text('text')->nullable();
            $table->timestampsTz();

            $table->index(['case_id', 'created_at']);
            $table->index('user_id');
        });

        Schema::create('office_case_actions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('case_id')
                ->constrained('office_cases')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('action');
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['case_id', 'created_at']);
            $table->index('user_id');
        });

        Schema::create('office_time_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('case_id')
                ->nullable()
                ->constrained('office_cases')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->decimal('duration', 5, 2);
            $table->text('description')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index('case_id');
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('office_case_tasks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('case_id')
                ->constrained('office_cases')
                ->cascadeOnDelete();
            $table->foreignId('assignee_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('title');
            $table->string('description', 500)->nullable();
            $table->timestampTz('deadline');
            $table->string('priority', 10)->default('medium');
            $table->string('status', 20)->default('todo');
            $table->timestampsTz();

            $table->index(['case_id', 'status']);
            $table->index(['assignee_id', 'status', 'deadline']);
            $table->index(['status', 'deadline']);
        });

        Schema::create('office_case_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('case_id')
                ->constrained('office_cases')
                ->cascadeOnDelete();
            $table->string('title', 512);
            $table->string('type', 100);
            $table->text('notes')->nullable();
            $table->timestampTz('event_at');
            $table->integer('reminder_before')->default(0);
            $table->boolean('reminder_sent')->default(false);

            $table->index(['case_id', 'event_at']);
            $table->index(['reminder_sent', 'event_at']);
        });

        Schema::create('office_case_ai', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('case_id')
                ->constrained('office_cases')
                ->cascadeOnDelete();
            $table->string('service_name');
            $table->string('model');
            $table->integer('tokens_used')->nullable();
            $table->jsonb('result')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['case_id', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE office_time_logs ADD CONSTRAINT office_time_logs_duration_check CHECK (duration > 0)');
            DB::statement("ALTER TABLE office_case_tasks ADD CONSTRAINT office_case_tasks_priority_check CHECK (priority IN ('low', 'medium', 'high'))");
            DB::statement("ALTER TABLE office_case_tasks ADD CONSTRAINT office_case_tasks_status_check CHECK (status IN ('todo', 'in_progress', 'completed', 'on_hold'))");
            DB::statement('ALTER TABLE office_case_events ADD CONSTRAINT office_case_events_reminder_before_check CHECK (reminder_before >= 0)');
            DB::statement('ALTER TABLE office_case_ai ADD CONSTRAINT office_case_ai_tokens_used_check CHECK (tokens_used IS NULL OR tokens_used >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('office_case_ai');
        Schema::dropIfExists('office_case_events');
        Schema::dropIfExists('office_case_tasks');
        Schema::dropIfExists('office_time_logs');
        Schema::dropIfExists('office_case_actions');
        Schema::dropIfExists('office_case_notes');
    }
};
