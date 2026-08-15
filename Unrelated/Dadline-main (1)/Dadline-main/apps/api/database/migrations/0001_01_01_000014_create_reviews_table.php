<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();

            $table->foreignId('reviewer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('vendor_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('type', [
                'doc',
                'case',
                'q_answer',
                'phone',
                'site',
                'vendor',
            ]);

            $table->unsignedBigInteger('item_id')->default(0);
            $table->unsignedBigInteger('rate');
            $table->text('review')->nullable();

            $table->enum('status', [
                'rejected',
                'approved',
                'hidden',
            ])->nullable()->default('approved');

            $table->timestampTz('created_at')->useCurrent();

            $table->index(['vendor_id', 'status', 'created_at']);
            $table->index(['type', 'item_id']);
            $table->index('reviewer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
