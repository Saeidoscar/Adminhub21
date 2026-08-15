<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('title', 500);
            $table->string('link', 755)->nullable();
            $table->boolean('is_viewed')->default(false);
            $table->string('priority', 10)->default('medium');
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('user_id', 'idx_personal_tasks_user');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
