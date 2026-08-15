<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('answers_question', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')
                ->constrained('questions')
                ->cascadeOnDelete();
            $table->foreignId('vendor_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->text('body');
            $table->string('status', 10)->default('approved');
            $table->timestampTz('created_at')->useCurrent();

            $table->index('question_id', 'idx_public_answers_question');
            $table->index(['vendor_id', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE answers_question ADD CONSTRAINT answers_question_status_check CHECK (status IN ('approved', 'rejected'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('answers_question');
    }
};
