<?php

use App\Enums\TicketDepartmentSlug;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_departments', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 32)->unique();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestampsTz();

            $table->index(['is_active', 'sort_order']);
        });

        $now = now();

        DB::table('ticket_departments')->insert(
            collect(TicketDepartmentSlug::cases())
                ->values()
                ->map(fn (TicketDepartmentSlug $department, int $index): array => [
                    'slug' => $department->value,
                    'is_active' => true,
                    'is_default' => $department === TicketDepartmentSlug::Support,
                    'sort_order' => ($index + 1) * 10,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
                ->all()
        );

        Schema::create('ticket_department_user', function (Blueprint $table): void {
            $table->foreignId('ticket_department_id')
                ->constrained('ticket_departments')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->timestampTz('created_at')->useCurrent();

            $table->primary(['ticket_department_id', 'user_id']);
            $table->index('user_id');
        });

        Schema::create('tickets', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignId('sender_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('department_id')
                ->constrained('ticket_departments')
                ->restrictOnDelete();

            $table->string('title', 256);

            $table->foreignId('assigned_to_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('provider_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('status', 10)->default('open');
            $table->string('priority', 12)->default('normal');

            $table->timestampTz('last_message_at')->nullable();
            $table->timestampTz('last_user_read_at')->nullable();
            $table->timestampTz('last_staff_read_at')->nullable();
            $table->timestampTz('last_provider_read_at')->nullable();
            $table->timestampTz('closed_at')->nullable();

            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz();

            $table->index('sender_id', 'idx_tickets_sender');
            $table->index('assigned_to_id');
            $table->index('provider_id');
            $table->index(['status', 'updated_at']);
            $table->index(
                ['department_id', 'status', 'priority'],
                'idx_tickets_department_status_priority'
            );
            $table->index('last_message_at');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                "ALTER TABLE tickets ADD CONSTRAINT tickets_status_check " .
                "CHECK (status IN ('open', 'answered', 'referred', 'pending', 'closed'))"
            );

            DB::statement(
                "ALTER TABLE tickets ADD CONSTRAINT tickets_priority_check " .
                "CHECK (priority IN ('low', 'normal', 'high', 'urgent'))"
            );
        }

        Schema::create('ticket_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('ticket_id')
                ->constrained('tickets')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->boolean('from_admin')->default(false);
            $table->boolean('is_internal')->default(false);
            $table->text('body');
            $table->foreignId('file_id')
                ->nullable()
                ->constrained('attachments')
                ->nullOnDelete();
            $table->timestampTz('created_at')->useCurrent();

            $table->index('ticket_id', 'idx_ticket_messages_ticket');
            $table->index('user_id');
            $table->index(
                ['ticket_id', 'is_internal', 'created_at'],
                'idx_ticket_messages_visibility'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_messages');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('ticket_department_user');
        Schema::dropIfExists('ticket_departments');
    }
};
