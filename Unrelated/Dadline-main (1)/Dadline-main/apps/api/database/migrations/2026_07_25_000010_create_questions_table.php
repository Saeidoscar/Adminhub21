<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->text('title');
            $table->text('body');
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('legal_categories')
                ->nullOnDelete();
            $table->boolean('is_private')->default(false);
            $table->string('slug')->nullable()->unique();
            $table->string('status', 10)->default('pending');
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->index(['category_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE questions ADD CONSTRAINT questions_status_check CHECK (status IN ('pending', 'approved', 'publish'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
