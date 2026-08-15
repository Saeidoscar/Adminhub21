<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('office_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('office_cases')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('storage_key');
            $table->string('original_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('size_bytes');
            $table->boolean('is_private')->default(false);
            $table->timestamp('created_at')->nullable();
            $table->index(['case_id', 'is_private']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('office_attachments');
    }
};
