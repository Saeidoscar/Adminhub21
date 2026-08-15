<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contract_id')
                ->constrained('contracts')
                ->cascadeOnDelete();
            $table->foreignId('attachment_id')
                ->constrained('attachments')
                ->restrictOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestampsTz();

            $table->unique(['contract_id', 'attachment_id']);
            $table->index('attachment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_attachments');
    }
};
