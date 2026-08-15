<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('office_case_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('office_cases')->cascadeOnDelete();
            $table->string('title');
            $table->string('type')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('event_at');
            $table->integer('reminder_before')->nullable();
            $table->boolean('reminder_sent')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('office_case_events');
    }
};
