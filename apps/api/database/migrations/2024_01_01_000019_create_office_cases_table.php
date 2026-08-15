<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('office_cases', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('office_id')->constrained()->cascadeOnDelete();
            $table->string('case_number')->nullable();
            $table->string('archive_number')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('open');
            $table->integer('case_fee')->nullable();
            $table->integer('progress')->default(0);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['office_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('office_cases');
    }
};
